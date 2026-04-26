$(document).ready(function () {
    // --- State Management ---
    const STORAGE_KEY = 'genshin_roster_data';
    let ownedCharacters = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let currentElementFilter = 'all';

    // Save to local storage
    function saveRoster() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedCharacters));
        updateGeneratorSelect(); // Re-render target select options based on owned chars
    }

    // Toggle character ownership
    function toggleCharacter(id) {
        if (ownedCharacters.includes(id)) {
            ownedCharacters = ownedCharacters.filter(charId => charId !== id);
        } else {
            ownedCharacters.push(id);
        }
        saveRoster();
    }

    // --- UI Rendering: Roster Management ---

    // Render Element Filters
    function renderFilters() {
        const filtersContainer = $('.element-filters');
        filtersContainer.empty();

        // 'All' button
        filtersContainer.append(`
            <button class="element-filter active text-white font-bold" data-element="all">All</button>
        `);

        // Element buttons
        elements.forEach(element => {
            // Using placeholder font-awesome or colored circles for elements
            filtersContainer.append(`
                <button class="element-filter bg-teyvat-${element}" data-element="${element}" title="${element}">
                    <img src="./images/elements/${element}.png" class="w-4 h-4 object-contain filter drop-shadow-sm opacity-90">
                </button>
            `);
        });

        // Filter Click Event
        $('.element-filter').on('click', function () {
            $('.element-filter').removeClass('active');
            $(this).addClass('active');
            currentElementFilter = $(this).data('element');
            renderCharacterGrid();
        });
    }

    // Replace broken images with initials fallback
    function getFallbackImage(name, colorStr) {
        const initials = name.substring(0, 2).toUpperCase();
        return `https://ui-avatars.com/api/?name=${initials}&background=1e293b&color=fff&size=128&font-size=0.4`;
    }

    // Render Character Grid
    function renderCharacterGrid() {
        const grid = $('#character-grid');
        grid.empty();

        const filteredChars = characters.filter(c =>
            currentElementFilter === 'all' || c.element === currentElementFilter
        );

        filteredChars.forEach(char => {
            const isOwned = ownedCharacters.includes(char.id);
            const stateClass = isOwned ? 'owned' : 'unowned';

            const cardHTML = `
                <div class="character-card ${stateClass}" data-id="${char.id}">
                    <div class="check-icon">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <img class="element-badge object-contain drop-shadow-sm" src="./images/elements/${char.element}.png" alt="${char.element}">
                    <div class="character-img-container">
                        <img src="${char.img}" alt="${char.name}" onerror="this.onerror=null;this.src='${getFallbackImage(char.name, char.element)}';">
                    </div>
                    <div class="character-name text-white">
                        ${char.name}
                    </div>
                </div>
            `;
            grid.append(cardHTML);
        });

        // Card Click Event
        $('.character-card').on('click', function () {
            const charId = $(this).data('id');
            const isOwned = ownedCharacters.includes(charId);

            if (isOwned) {
                ownedCharacters = ownedCharacters.filter(id => id !== charId);
                $(this).removeClass('owned').addClass('unowned');
            } else {
                ownedCharacters.push(charId);
                $(this).removeClass('unowned').addClass('owned');
            }

            // Save immediately!
            localStorage.setItem('genshin_roster_data', JSON.stringify(ownedCharacters));

        });
    }

    // --- UI Rendering: Team Generator ---


    function renderMissingCardHTML(charId) {
        // find character
        const char = characters.find(c => c.id === charId);
        if (!char) return '';

        return `
            <div class="team-member-slot missing flex flex-col items-center justify-center relative cursor-help" title="Missing: ${char.name}">
                <img src="${char.img}" class="w-full h-full object-cover opacity-50" onerror="this.onerror=null;this.src='${getFallbackImage(char.name)}';">
                <div class="missing-badge"><i class="fa-solid fa-lock mr-1"></i> Not Owned</div>
            </div>
        `;
    }

    function renderOwnedCardHTML(charId) {
        const char = characters.find(c => c.id === charId);
        if (!char) return '';

        return `
            <div class="team-member-slot relative">
                <img src="./images/elements/${char.element}.png" class="absolute top-1 left-1 w-5 h-5 z-10 drop-shadow-md opacity-90 object-contain">
                <img src="${char.img}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${getFallbackImage(char.name)}';">
                <div class="character-name absolute bottom-0 w-full text-xs font-semibold bg-gray-900/80">${char.name}</div>
            </div>
        `;
    }

    function renderTeamsLocal(relevantTeams, targetCharId, isFallback = false) {
        const container = $('#teams-container');
        container.empty();

        if (isFallback) {
            container.append(`
                <div class="glass-card mb-6 rounded-2xl p-4 border border-rose-500/50 bg-rose-500/10 fade-in">
                    <p class="text-rose-200 text-sm font-semibold"><i class="fa-solid fa-cloud-bolt text-rose-400 mr-2"></i>Network Error. The AI could not be reached. Displaying local offline fallback teams instead.</p>
                </div>
            `);
        }

        if (relevantTeams.length === 0) {
            container.append(`
                <div class="text-center py-12 glass-card rounded-2xl border border-teyvat-border">
                    <i class="fa-solid fa-face-frown text-4xl text-gray-500 mb-4"></i>
                    <p class="text-gray-400">No preset teams found for this character yet.</p>
                </div>
            `);
            return;
        }

        // 2. Score and sort teams based on ownership.
        // Highest priority: target is owned, AND user owns all members.
        relevantTeams.forEach(team => {
            const ownedCount = team.members.filter(m => ownedCharacters.includes(m)).length;
            team.missingCount = team.members.length - ownedCount;
        });

        // Sort: Least missing characters first
        relevantTeams.sort((a, b) => a.missingCount - b.missingCount);

        let html = '';
        relevantTeams.forEach(team => {
            const isPerfect = team.missingCount === 0;
            const cardStyle = isPerfect ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-teyvat-border opacity-90';
            const statusBadge = isPerfect
                ? '<span class="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-bold ml-2 border border-green-500/30"><i class="fa-solid fa-check-circle mr-1"></i> Ready to build</span>'
                : `<span class="bg-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded-full font-bold ml-2 border border-rose-500/30">Missing ${team.missingCount} member(s)</span>`;

            html += `
                <div class="glass-card rounded-2xl p-5 border ${cardStyle} transition-all hover:bg-slate-800/60 fade-in">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold flex items-center">${team.name} ${statusBadge}</h3>
                    </div>
                    <p class="text-sm text-gray-400 mb-4 italic">"${team.description}"</p>
                    
                    <div class="grid grid-cols-4 gap-4 max-w-2xl">
                        ${team.members.map(memberId => {
                if (ownedCharacters.includes(memberId)) {
                    return renderOwnedCardHTML(memberId);
                } else {
                    return renderMissingCardHTML(memberId);
                }
            }).join('')}
                    </div>
                </div>
            `;
        });

        container.append(html);
    }

    // --- Tab Navigation Setup ---
    $('#tab-roster').on('click', function () {
        $('.nav-btn').removeClass('active relative');
        $(this).addClass('active relative');
        $('.tab-pane').addClass('hidden');
        $('#roster-section').removeClass('hidden');
        // Re-render grid to apply any state changes correctly in case
        renderCharacterGrid();
    });

    $('#tab-generator').on('click', function () {
        $('.nav-btn').removeClass('active relative');
        $(this).addClass('active relative');
        $('.tab-pane').addClass('hidden');
        $('#generator-section').removeClass('hidden');
    });

    // --- Enhanced Target Selector & AI Generator ---
    let currentTargetCharId = null;

    $('#open-target-selector-btn').on('click', function () {
        $('#target-modal').removeClass('hidden').addClass('flex');
        renderTargetModalGrid();
    });

    $('#close-modal-btn').on('click', function () {
        $('#target-modal').addClass('hidden').removeClass('flex');
    });

    $('#target-info-card').on('click', function () {
        $('#target-modal').removeClass('hidden').addClass('flex');
        renderTargetModalGrid();
    });

    $('#target-search-input').on('input', function () {
        renderTargetModalGrid($(this).val());
    });

    function renderTargetModalGrid(searchQuery = '') {
        const grid = $('#target-modal-grid');
        grid.empty();

        const query = searchQuery.toLowerCase();

        characters.forEach(char => {
            if (query && !char.name.toLowerCase().includes(query)) return;

            const isOwned = ownedCharacters.includes(char.id);
            const opacity = isOwned ? 'opacity-100' : 'opacity-40 hover:opacity-80';
            const ownershipBadge = isOwned ? '<div class="absolute -top-2 -right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md z-20"><i class="fa-solid fa-check text-white"></i></div>' : '';

            grid.append(`
                <div class="target-select-card relative cursor-pointer transition-transform hover:scale-105 ${opacity}" data-id="${char.id}">
                    ${ownershipBadge}
                    <img src="${char.img}" class="w-full aspect-square object-cover rounded-xl border border-teyvat-border hover:border-teyvat-accent shadow-lg bg-slate-800" onerror="this.onerror=null;this.src='${getFallbackImage(char.name)}';">
                    <div class="text-center text-xs font-semibold mt-2 truncate text-gray-300 w-full">${char.name}</div>
                </div>
            `);
        });

        $('.target-select-card').on('click', function () {
            const charId = $(this).data('id');
            setTargetCharacter(charId);
            $('#target-modal').addClass('hidden').removeClass('flex');
        });
    }

    function setTargetCharacter(charId) {
        currentTargetCharId = charId;
        const char = characters.find(c => c.id === charId);
        if (!char) return;

        // Swap UI Layout
        $('#open-target-selector-btn').addClass('hidden');
        $('#target-info-card').removeClass('hidden');
        $('#target-info-img').attr('src', char.img);
        $('#target-info-name').text(char.name);
        $('#generate-ai-teams-btn').removeClass('hidden');

        // Reset container visually
        $('#teams-container').html(`
            <div class="text-center py-16 text-gray-500 glass-card rounded-2xl border border-teyvat-border border-dashed fade-in">
                <i class="fa-solid fa-robot text-5xl opacity-40 mb-4"></i>
                <p>Ready to consult the AI for the absolute best <strong>${char.name}</strong> teams!</p>
            </div>
        `);
    }

    // AI Generation Hook
    $('#generate-ai-teams-btn').on('click', async function () {
        if (!currentTargetCharId) return;
        const char = characters.find(c => c.id === currentTargetCharId);

        const btn = $(this);
        btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin mr-2"></i> Analyzing Meta...');

        const container = $('#teams-container');
        container.html(`
        <div class="text-center py-20 text-teyvat-accent glass-card rounded-2xl border border-teyvat-accent/30 shadow-[0_0_30px_rgba(56,189,248,0.1)] fade-in">
            <i class="fa-solid fa-wand-magic-sparkles fa-bounce text-6xl mb-6"></i>
            <h3 class="text-2xl font-bold mb-2">Consulting AI Oracle...</h3>
            <p class="text-white/70">Calculating optimal synergies for ${char.name} based on your roster.</p>
            <div class="w-full max-w-sm mx-auto h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-500 to-teyvat-accent w-1/2 animate-[ping-pong_1.5s_ease-in-out_infinite]"></div>
            </div>
        </div>
    `);

        const ownedNames = ownedCharacters
            .map(id => characters.find(x => x.id === id)?.name)
            .filter(Boolean);

        const prompt = `You are an expert Genshin Impact theorycrafter.
Build exactly 3 highly synergistic, meta-valid teams where "${char.name}" is the primary focus.
Owned characters: ${ownedNames.length > 0 ? ownedNames.join(', ') : 'None'}.
Heavily prioritize owned characters for the remaining 3 slots. Only suggest unowned characters if truly essential.

Respond ONLY with a valid JSON array — no markdown, no backticks, no explanation.
Schema:
[
  {
    "name": "Team Name",
    "description": "One sentence explaining the synergy.",
    "members": ["Character 1", "Character 2", "Character 3", "Character 4"]
  }
]
"${char.name}" must always appear in members.`;

        // --- Attempt 1: Gemini AI (CORS Proxy) ---
        const tryGemini = async () => {
            const API_KEY = 'API_KEY';
            const url = `https://cors-anywhere.herokuapp.com/https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-requested-with': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!res.ok) {
                const errorBody = await res.text();
                console.error('Gemini API Error:', res.status, errorBody);
                throw new Error(`Gemini HTTP ${res.status}: ${errorBody}`);
            }
            const data = await res.json();

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            const match = text.match(/\[[\s\S]*\]/);
            if (!match) throw new Error('No JSON array in Gemini response');
            return JSON.parse(match[0]);
        };

        // --- Attempt 2: Pollinations AI (Free, No Key) ---
        const tryPollinations = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
            try {
                const res = await fetch(
                    'https://text.pollinations.ai/prompt/' + encodeURIComponent(prompt + "\nRespond ONLY with JSON."),
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
                const text = await res.text();
                const match = text.match(/\[[\s\S]*\]/);
                if (!match) throw new Error('No JSON array in Pollinations response');
                return JSON.parse(match[0]);
            } finally {
                clearTimeout(timeout);
            }
        };

        // --- Attempt 3: Local rule-based generation (always works) ---
        const generateLocal = () => {
            // Pull from preset data first
            let preset = teamsData.filter(t => t.members.includes(char.id));
            if (preset.length >= 3) return preset.slice(0, 3);

            // Smart local fallback: build teams from owned characters by element role heuristics
            const roleMap = {
                healers: ['barbara', 'qiqi', 'kokomi', 'bennett', 'noelle', 'diona', 'jean'],
                shields: ['zhongli', 'noelle', 'diona', 'layla', 'thoma', 'xinyan'],
                buffers: ['bennett', 'sara', 'shenhe', 'gorou', 'faruzan', 'mika'],
                vaporize: ['xiangling', 'hu-tao', 'yanfei', 'amber'],
                freeze: ['kaeya', 'rosaria', 'chongyun', 'ayaka', 'ganyu'],
                electro: ['fischl', 'beidou', 'raiden', 'yae-miko', 'lisa'],
                anemo: ['venti', 'kazuha', 'sucrose', 'jean', 'sayu'],
                geo: ['zhongli', 'albedo', 'ningguang', 'noelle', 'gorou'],
            };

            const pick = (pool) => {
                // Prefer owned, else take first available
                const owned = pool.filter(id => ownedCharacters.includes(id) && id !== char.id);
                return owned[0] ?? pool.find(id => id !== char.id);
            };

            const safeTeam = (extras, name, description) => ({
                id: `local_${Math.random().toString(36).slice(2)}`,
                name,
                description,
                members: [char.id, ...extras.filter(Boolean).slice(0, 3)],
                missingCount: 0
            });

            return [
                safeTeam(
                    [pick(roleMap.buffers), pick(roleMap.vaporize), pick(roleMap.healers)],
                    `${char.name} Vaporize Core`,
                    'Maximize damage with Pyro/Hydro resonance and a dedicated healer.'
                ),
                safeTeam(
                    [pick(roleMap.anemo), pick(roleMap.electro), pick(roleMap.shields)],
                    `${char.name} Aggravate Support`,
                    'Electro resonance and Anemo crowd control for consistent DPS.'
                ),
                safeTeam(
                    [pick(roleMap.freeze), pick(roleMap.geo), pick(roleMap.buffers)],
                    `${char.name} Universal Flex`,
                    'Versatile team structure adaptable to most content.'
                ),
            ].map(t => ({ ...t, members: [...new Set(t.members)].slice(0, 4) }));
        };

        // --- Normalize AI member names → character IDs ---
        const normalizeTeams = (teamsRaw) =>
            teamsRaw.map((t, idx) => ({
                id: `ai_team_${idx}`,
                name: t.name,
                description: t.description,
                members: t.members.map(mName => {
                    const key = mName.toLowerCase().replace(/[^a-z]/g, '');
                    const found = characters.find(c =>
                        c.name.toLowerCase().replace(/[^a-z]/g, '') === key ||
                        c.id.replace(/[^a-z]/g, '') === key
                    );
                    return found ? found.id : mName.toLowerCase().replace(/ /g, '-');
                }),
                missingCount: 0
            }));

        // --- Run cascade ---
        let teams = null;
        let usedFallback = false;
        let source = '';

        try {
            const raw = await tryGemini();
            teams = normalizeTeams(raw);
            source = 'Gemini AI';
        } catch (e1) {
            console.warn('Gemini failed, trying Pollinations...', e1);
            try {
                const raw = await tryPollinations();
                teams = normalizeTeams(raw);
                source = 'Pollinations AI';
            } catch (e2) {
                console.warn('Pollinations failed, using local generator.', e2);
                teams = generateLocal();
                usedFallback = true;
                source = 'Local Engine';
            }
        }

        renderTeamsLocal(teams, currentTargetCharId, usedFallback);

        // Optional: show which source was used (helpful for debugging)
        if (usedFallback) {
            container.prepend(`
            <div class="text-center text-xs text-white/40 mb-2">
                <i class="fa-solid fa-circle-info mr-1"></i> Generated locally — AI services unavailable.
            </div>
        `);
        }

        btn.prop('disabled', false).html('<i class="fa-solid fa-wand-magic-sparkles mr-2"></i> ✨ Ask AI for Teams ✨');
    });

    // --- UID Fetching ---

    $('#fetch-uid-btn').on('click', async function () {
        const uid = $('#uid-input').val().trim();

        if (!uid || uid.length < 9) {
            alert('Please enter a valid UID.');
            return;
        }

        const btn = $(this);
        const originalText = btn.html();
        btn.html('<i class="fa-solid fa-spinner fa-spin"></i> Fetching...');
        btn.prop('disabled', true);

        try {
            const res = await fetch(`https://enka.network/api/uid/${uid}`);

            if (res.status === 424) {
                throw new Error('PRIVATE');
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            console.log("API DATA:", data);

            if (data.avatarInfoList && data.avatarInfoList.length > 0) {
                data.avatarInfoList.forEach(avatar => {
                    const numId = avatar.avatarId;
                    const charName = avatarIdMap[numId];

                    if (!charName) return;

                    const matchingChar = characters.find(c =>
                        c.name.toLowerCase() === charName.toLowerCase() ||
                        c.id.toLowerCase() === charName.toLowerCase()
                    );

                    if (matchingChar && !ownedCharacters.includes(matchingChar.id)) {
                        ownedCharacters.push(matchingChar.id);
                    }
                });

                saveRoster();
                renderCharacterGrid();
            }

            alert(`Added ${fetchedCount} character(s)!`);

        } catch (err) {
            console.error(err);

            if (err.message === 'PRIVATE') {
                alert('Profile is private.\nEnable "Show Character Details" in Genshin.');
            } else {
                alert('Failed to fetch data.\n(Check console for details)');
            }
        } finally {
            btn.html(originalText);
            btn.prop('disabled', false);
        }
    });

    // We've replaced target-character-select logic so we dump previous dead select listeners    // --- Initialization ---
    // Ensure standard traveler exists or clean it up if necessary (our db generated it cleanly)
    characters.sort((a, b) => a.name.localeCompare(b.name));

    renderFilters();
    renderCharacterGrid();
});
