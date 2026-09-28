<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legitimate Collector - TTM & Card Directory</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        darkBg: '#0f172a',
                        darkCard: '#1e293b',
                        darkBorder: '#334155',
                        goldPrimary: '#f59e0b'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-darkBg text-gray-200 min-h-screen font-sans flex flex-col">

    <!-- Header Navigation -->
    <header class="bg-darkCard border-b border-darkBorder sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <span class="text-2xl font-black text-amber-400 tracking-wider">LEGITIMATE COLLECTOR</span>
            </div>
            <nav class="flex items-center gap-4 text-sm font-semibold">
                <a href="index.html" class="text-amber-400 border-b-2 border-amber-400 pb-1">Directory</a>
            </nav>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto w-full px-4 py-8 flex-grow">
        
        <!-- Controls & Search -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h1 class="text-2xl font-bold text-white">Signer Directory & TTM Logs</h1>
            <input type="text" id="searchInput" placeholder="Search player, team, or sport..." 
                   class="w-full sm:w-80 px-4 py-2 bg-darkCard border border-darkBorder rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition text-sm">
        </div>

        <!-- Directory Table Container -->
        <div class="bg-darkCard border border-darkBorder rounded-xl shadow-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-darkBg/50 text-gray-400 uppercase text-xs border-b border-darkBorder">
                        <tr>
                            <th class="px-4 py-3">Player Name</th>
                            <th class="px-4 py-3">Sport / Team</th>
                            <th class="px-4 py-3">Success Rate</th>
                            <th class="px-4 py-3">Avg Response</th>
                            <th class="px-4 py-3">Tested Address / Notes</th>
                            <th class="px-4 py-3 text-right">Affiliate Search</th>
                        </tr>
                    </thead>
                    <tbody id="directoryTableBody">
                        <tr>
                            <td colspan="6" class="p-6 text-center text-gray-400 animate-pulse">Loading database records...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-darkCard border-t border-darkBorder py-6 text-center text-xs text-gray-500 mt-auto">
        &copy; 2026 Legitimate Collector. Powered by Supabase & GitHub Pages.
    </footer>

    <!-- Consolidated Application Logic -->
    <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

        // --- 1. SUPABASE CONFIGURATION ---
        // Replace these placeholder strings with your actual Supabase URL and anon key if needed
        const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
        const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
        
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        let allSigners = [];

        // --- 2. INITIALIZATION ---
        window.addEventListener('DOMContentLoaded', () => {
            fetchSigners();
            setupSearch();
        });

        // --- 3. DATABASE FETCHING ---
        async function fetchSigners() {
            const tbody = document.getElementById('directoryTableBody');

            const { data: signers, error } = await supabase
                .from('signers')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Supabase Query Error:', error);
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-red-400 text-center">Error loading directory: ${error.message}</td></tr>`;
                return;
            }

            if (!signers || signers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-gray-400 text-center">No signers found in database.</td></tr>`;
                return;
            }

            allSigners = signers;
            renderTable(allSigners);
        }

        // --- 4. TABLE RENDERER ---
        function renderTable(data) {
            const tbody = document.getElementById('directoryTableBody');

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-gray-400 text-center">No matching signers found.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map(signer => {
                const ebayUrl = getEbayAffiliateUrl(signer.name);
                const sportlotsUrl = getSportlotsUrl(signer.name);
                const scnUrl = getScnUrl(signer.name);

                return `
                    <tr class="border-b border-darkBorder hover:bg-darkBg/40 transition">
                        <td class="px-4 py-3 font-semibold text-white">${signer.name}</td>
                        <td class="px-4 py-3 text-gray-300">${signer.sport || '-'} / ${signer.team || '-'}</td>
                        <td class="px-4 py-3 text-amber-400 font-semibold">${signer.success_rate || 'N/A'}</td>
                        <td class="px-4 py-3 text-green-400 font-semibold">${signer.avg_response || 'Pending'}</td>
                        <td class="px-4 py-3 text-gray-400 text-xs font-mono">${signer.tested_address || '-'}</td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                                <a href="${ebayUrl}" target="_blank" rel="noopener noreferrer" 
                                   class="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded text-xs hover:bg-amber-400 hover:text-black transition">
                                    eBay
                                </a>
                                <a href="${sportlotsUrl}" target="_blank" rel="noopener noreferrer" 
                                   class="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded text-xs hover:bg-amber-400 hover:text-black transition">
                                    Sportlots
                                </a>
                                <a href="${scnUrl}" target="_blank" rel="noopener noreferrer" 
                                   class="px-2 py-1 bg-darkCard border border-darkBorder text-gray-300 font-semibold rounded text-xs hover:border-amber-400 hover:text-white transition">
                                    SCN
                                </a>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // --- 5. SEARCH FILTER ---
        function setupSearch() {
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allSigners.filter(s => 
                    (s.name && s.name.toLowerCase().includes(term)) ||
                    (s.sport && s.sport.toLowerCase().includes(term)) ||
                    (s.team && s.team.toLowerCase().includes(term)) ||
                    (s.tested_address && s.tested_address.toLowerCase().includes(term))
                );
                renderTable(filtered);
            });
        }

        // --- 6. AFFILIATE LINK GENERATORS ---
        function getEbayAffiliateUrl(playerName) {
            const query = encodeURIComponent(`${playerName} autographed card`);
            return `https://www.ebay.com/sch/i.html?_nkw=${query}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
        }

        function getSportlotsUrl(playerName) {
            const query = encodeURIComponent(playerName);
            return `https://www.sportlots.com/inven/invenbin/dealnew.tpl?pname=${query}&Ref=Bets1202`;
        }

        function getScnUrl(playerName) {
            const query = encodeURIComponent(playerName);
            return `https://www.sportscollectors.net/Search.aspx?search=${query}`;
        }
    </script>
</body>
</html>
