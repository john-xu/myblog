module.exports = {
    title: '慕远',
    description: '慕远的小码头',
    head: [
        ['link', { rel: 'icon', href: '/logo.png' }]
    ],
    themeConfig: {
        nav: [
            { text: 'Node.js', link: '/nodejs/'}
        ],
        // displayAllHeaders: true,
        sidebar: {
            '/nodejs/': [
                ['', 'nodejs'],
                ['kafka-node', 'kafka-node的使用'],
                ['pm2', 'pm2的使用']
            ]
        }
    }
}