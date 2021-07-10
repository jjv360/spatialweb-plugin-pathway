export default class PathwayPlugin extends BasePlugin {

    /** Plugin info */
    static id = 'jjv360.pathway'
    static name = 'Pathway Plugin'
    static description = 'Used in the @jjv360-pathway space.'

    /** Called on load */
    onLoad() {

        // Add info button
        this.menus.register({
            title: "What is this?",
            text: "What is this?",
            section: 'controls',
            panel: {
                iframeURL: require('./whatisthis.html')
            }
        })

    }

}