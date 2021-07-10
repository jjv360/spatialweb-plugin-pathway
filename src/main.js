export default class PathwayPlugin extends BasePlugin {

    /** Plugin info */
    static id = 'jjv360.pathway'
    static name = 'Pathway Plugin'
    static description = 'Used in the @jjv360-pathway space.'

    /** List of all running components */
    static components = []

    /** Called on load */
    onLoad() {

        // Register component
        this.objects.registerComponent(PathwayFloorTile, {
            id: 'pathway-floor-tile',
            name: 'Pathway Floor Tile',
            description: "Can either allow the user to walk on it, or not.",
            settings: [
                { type: 'label', value: "This component reads the 'Collide' field to tell if it's a correct pathway tile, and highlights the floor when a user walks on it." }
            ]
        })

        // Add panel view
        this.menus.register({
            section: 'infopanel',
            panel: {
                iframeURL: absolutePath('infopanel.html'),
                width: 400,
                height: 100
            }
        })

        // Preload sound effects
        this.audio.preload(absolutePath('good-ding.wav'))
        this.audio.preload(absolutePath('bad-ding.flac'))

        // Start render timer
        // TODO: Some better way to receive avatar position updates every frame?
        this.renderTimer = setInterval(this.onRender.bind(this), 1000/20)

    }

    /** Called on unload */
    onUnload() {

        // Remove timer
        clearInterval(this.renderTimer)

    }

    /** Called every frame */
    onRender() {

        // Stop if busy with last frame still
        if (this.isUpdatingPositions) return
        this.isUpdatingPositions = true

        // Update positions
        this.updatePositions().catch(e => console.warn(e)).then(e => {
            this.isUpdatingPositions = false
        })

    }

    async updatePositions() {

        // Get user's position
        let userPos = await this.user.getPosition()

        // Run each component's timer
        for (let comp of PathwayPlugin.components)
            comp.onRender(userPos)

    }

}

class PathwayFloorTile extends BaseComponent {

    /** Date to deactivate the tile automatically. Also used as a flag, if this is non-zero, then the tile is currently activated. */
    deactivateAt = 0

    /** Duration the tile should be actiated for */
    activationDuration = 8000

    /** Called on load */
    onLoad() {

        // Store active component
        PathwayPlugin.components.push(this)

    }

    /** Called on unload */
    onUnload() {

        // Remove unloaded component
        PathwayPlugin.components = PathwayPlugin.components.filter(c => c != this)

    }

    /** Called every frame, by the main plugin class */
    onRender(userPos) {

        // Check if user is inside the box
        let insideX = userPos.x >= this.fields.world_center_x - this.fields.world_bounds_x/2 && userPos.x <= this.fields.world_center_x + this.fields.world_bounds_x/2
        let insideY = userPos.y >= this.fields.world_center_y - this.fields.world_bounds_y/2 && userPos.y <= this.fields.world_center_y + this.fields.world_bounds_y/2 + 2
        let insideZ = userPos.z >= this.fields.world_center_z - this.fields.world_bounds_z/2 && userPos.z <= this.fields.world_center_z + this.fields.world_bounds_z/2
        let isInside = insideX && insideY && insideZ

        // Activate tile if user is inside
        if (isInside)
            this.activateTile()
            
        // If enough time has passed, deactivate the tile
        if (this.deactivateAt && Date.now() >= this.deactivateAt)
            this.deactivateTile()

    }

    /** Called when we receive a message from a remote instance of this component */
    onMessage(data) {

        // Stop if unsupported message
        if (data?.action != 'activate-tile')
            return

        // Activate the tile
        this.activateTile()

    }

    /** Highlight the tile */
    activateTile() {

        // Check if it is already activated
        if (this.deactivateAt) {

            // Already activated, just extend the deactivation date
            this.deactivateAt = Date.now() + this.activationDuration

            // Send a message to everyone else that this tile should be activated, send it every 5 seconds
            if (Date.now() - this.lastActivateMessageDate > 4000) {
                this.sendMessage({ action: 'activate-tile' })
                this.lastActivateMessageDate = Date.now()
            }

        } else {

            // Check if this is a good or bad tile
            let isGood = !!this.fields.collide

            // Activate! Play the sound
            this.plugin.audio.play(absolutePath(isGood ? 'good-ding.wav' : 'bad-ding.flac'), {
                x: this.fields.world_center_x,
                height: this.fields.world_center_y,
                y: this.fields.world_center_z,
                radius: 20
            })

            // Set color
            let color = isGood ? '#8F8' : '#F88'
            this.plugin.objects.update(this.objectID, { color }, true)

            // Start a timer to reset this tile
            this.deactivateAt = Date.now() + this.activationDuration

            // Send a message to everyone else that this tile should be activated
            this.sendMessage({ action: 'activate-tile' })
            this.lastActivateMessageDate = Date.now()

        }

    }

    /** Deactivate the tile */
    deactivateTile() {

        // Remove deactivate timer
        this.deactivateAt = 0

        // Set color
        this.plugin.objects.update(this.objectID, { color: 'white' }, true)

    }

}