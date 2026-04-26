// Character Database
const elements = ['pyro', 'hydro', 'anemo', 'electro', 'dendro', 'cryo', 'geo'];

const characters = charactersDatabase; // Populated statically via local scraper

// Teams Database
const teamsData = [
    {
        id: 'raiden_national',
        name: 'Raiden National',
        description: 'A powerful, easy-to-play team that constantly triggers overvape reactions.',
        members: ['raiden-shogun', 'xingqiu', 'xiangling', 'bennett']
    },
    {
        id: 'double_hydro_hutao',
        name: 'Double Hydro Hu Tao',
        description: 'Incredible single target damage, max HP synergy between Hu Tao, Yelan, and Zhongli.',
        members: ['hu-tao', 'yelan', 'xingqiu', 'zhongli']
    },
    {
        id: 'alhaitham_quickbloom',
        name: 'Alhaitham Quickbloom',
        description: 'High sustained Dendro core generation with constant Quicken uptime.',
        members: ['alhaitham', 'nahida', 'xingqiu', 'kuki-shinobu']
    },
    {
        id: 'neuvillette_hypercarry',
        name: 'Neuvillette Hypercarry',
        description: 'Unstoppable Hydro beam damage with continuous healing and buffing from Furina.',
        members: ['neuvillette', 'furina', 'kaedehara-kazuha', 'zhongli']
    },
    {
        id: 'ayaka_premium_freeze',
        name: 'Premium Freeze',
        description: 'Keeps enemies permanently frozen while Ayaka unleashes devastating bursts.',
        members: ['kamisato-ayaka', 'shenhe', 'kaedehara-kazuha', 'sangonomiya-kokomi']
    },
    {
        id: 'international_childe',
        name: 'Childe International',
        description: 'The highest ceiling AoE team in the game, utilizing Kazuha double swirls.',
        members: ['tartaglia', 'kaedehara-kazuha', 'xiangling', 'bennett']
    },
    {
        id: 'navia_plunge',
        name: 'Navia Double Geo',
        description: 'Explosive Geo shotgun damage benefiting from crystallize shields.',
        members: ['navia', 'zhongli', 'yelan', 'bennett']
    },
    {
        id: 'arlecchino_vape',
        name: 'Arlecchino Vape',
        description: 'High burst output via Bond of Life scaling with vaporize reactions.',
        members: ['arlecchino', 'yelan', 'bennett', 'zhongli']
    },
    {
        id: 'raiden_hypercarry',
        name: 'Raiden Hypercarry',
        description: 'Maximized Raiden burst damage using premium supports.',
        members: ['raiden-shogun', 'kaedehara-kazuha', 'bennett', 'chevreuse']
    },
    {
        id: 'taser',
        name: 'Classic Taser',
        description: 'Electro-charge off-field supremacy.',
        members: ['sucrose', 'fischl', 'beidou', 'xingqiu']
    }
];
