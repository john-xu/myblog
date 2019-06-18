module.exports = {
    title: '慕远',
    description: '慕远的小码头',
    head: [
        ['link', { rel: 'icon', href: '/logo.png' }]
    ],
    themeConfig: {
        repo: 'john-xu/myblog',
        repoLabel: '查看源码',
        editLinks: true,
        editLinkText: '帮助我们改善此页面！',
        lastUpdated: '最后更新于',
        nav: [
            { text: 'Node.js', link: '/nodejs/'},
            { text: 'Docker', link: '/docker/'}
        ],
        // displayAllHeaders: true,
        sidebar: {
            '/nodejs/': [
                ['', 'nodejs'],
                ['kafka-node', 'kafka-node的使用'],
                ['pm2', 'pm2的使用'],
                ['express-session-redis', '使用redis存储express的session']
            ],
            '/docker/': [
                ['', 'docker']
            ]
        },
    }
}