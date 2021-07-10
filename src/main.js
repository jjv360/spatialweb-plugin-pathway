export default class PathwayPlugin extends BasePlugin {

    /** Plugin info */
    static id = 'jjv360.pathway'
    static name = 'Pathway Plugin'
    static description = 'Used in the @jjv360-pathway space.'

    /** Called on load */
    onLoad() {

        // Show alert
        this.menus.alert("The webpack plugin has loaded!", "My Webpack Plugin", "info")

    }

}