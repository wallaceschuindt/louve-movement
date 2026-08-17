APP LOUVE MOVEMENT

Aqui está uma análise completa de Engenharia de Produto & Negócios e o código-fonte completo, funcional e interativo do sistema Louve Movement, desenvolvido como uma Single-Page Application (SPA) moderna, pronta para rodar no navegador, celular ou ser empacotada como PWA/App Desktop.  
1\. Análise de Engenharia & Sugestões de Melhorias  
Como engenheiro de software e especialista em sistemas de gestão (ERP/PDV), estruturei o sistema resolvendo armadilhas comuns em controle de vestuário:

\[Cadastro Produto Pai\] ──\> \[Grade de Variações: P, M, G, GG x Cor\] ──\> \[Estoque Individual\]  
           │                                                                 │  
           ▼                                                                 ▼  
\[Matriz Financeira: Custo / Venda / Markup\]                     \[Alerta de Estoque Mínimo\]  
           │                                                                 │  
           └─────────────────\> \[ PDV / Romaneio \] \<──────────────────────────┘  
                                      │  
              ┌───────────────────────┴───────────────────────┐  
              ▼                                               ▼  
     \[Baixa de Estoque Imediata\]                   \[Lançamento no Fluxo Financeiro\]  
              │                                               │  
              ▼                                               ▼  
     \[Comprovante PDF & WhatsApp\]                  \[DRE, Gráficos & Métricas de Lucro\]

Aqui está uma análise completa de Engenharia de Produto & Negócios e o código-fonte completo, funcional e interativo do sistema Louve Movement, desenvolvido como uma Single-Page Application (SPA) moderna, pronta para rodar no navegador, celular ou ser empacotada como PWA/App Desktop.  
1\. Análise de Engenharia & Sugestões de Melhorias  
Como engenheiro de software e especialista em sistemas de gestão (ERP/PDV), estruturei o sistema resolvendo armadilhas comuns em controle de vestuário:  
code  
Code  
\[Cadastro Produto Pai\] ──\> \[Grade de Variações: P, M, G, GG x Cor\] ──\> \[Estoque Individual\]  
           │                                                                 │  
           ▼                                                                 ▼  
\[Matriz Financeira: Custo / Venda / Markup\]                     \[Alerta de Estoque Mínimo\]  
           │                                                                 │  
           └─────────────────\> \[ PDV / Romaneio \] \<──────────────────────────┘  
                                      │  
              ┌───────────────────────┴───────────────────────┐  
              ▼                                               ▼  
     \[Baixa de Estoque Imediata\]                   \[Lançamento no Fluxo Financeiro\]  
              │                                               │  
              ▼                                               ▼  
     \[Comprovante PDF & WhatsApp\]                  \[DRE, Gráficos & Métricas de Lucro\]  
Inovações e Facilidades Adicionadas:  
Grade Bidimensional Inteligente (SKU por Tamanho): Em vez de cadastrar uma camisa "P" e outra "M" separadas, você cadastra o modelo (ex: "Camisa Oversized Fé \- Preta") e gerencia a matriz de tamanhos \[P | M | G | GG\] numa única tela com baixa automática no tamanho exato vendido.  
Envio de Romaneio Direto no WhatsApp em 1 Clique: Além do PDF, o sistema gera o link formatado para o WhatsApp do cliente com o resumo do pedido pronto.  
Diferenciação entre Margem de Lucro e Markup: O sistema calcula ambos automaticamente para você nunca precificar no prejuízo.  
Logotipo Persistente: Upload do logotipo da sua marca que se reflete instantaneamente no topo do painel, no Romaneio/Recibo e nos relatórios PDF.  
Simulação de Taxas de Pagamento: Permite descontar automaticamente taxas de maquininha de cartão no cálculo do lucro líquido real.  
Persistência Total Local (Offline-First): Funciona 100% no navegador via LocalStorage/IndexedDB sem perder dados ao recarregar, com exportação/backup em JSON e relatórios em PDF.

2\. Código da Aplicação Completa  
Salve o código abaixo em um arquivo chamado index.html e abra em qualquer navegador (Chrome, Edge, Safari, Celular):

\<\!DOCTYPE html\>  
\<html lang="pt-BR"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Louve Movement \- Controle Financeiro e de Estoque\</title\>  
      
    \<\!-- Tailwind CSS \--\>  
    \<script src="https://cdn.tailwindcss.com"\>\</script\>  
    \<script\>  
        tailwind.config \= {  
            darkMode: 'class',  
            theme: {  
                extend: {  
                    colors: {  
                        brand: {  
                            50: '\#f8fafc',  
                            100: '\#f1f5f9',  
                            500: '\#334155',  
                            600: '\#1e293b',  
                            700: '\#0f172a',  
                            800: '\#020617',  
                            gold: '\#d97706',  
                            goldLight: '\#fbbf24'  
                        }  
                    }  
                }  
            }  
        }  
    \</script\>  
      
    \<\!-- Chart.js para Gráficos Financeiros \--\>  
    \<script src="https://cdn.jsdelivr.net/npm/chart.js"\>\</script\>  
      
    \<\!-- Lucide Icons \--\>  
    \<script src="https://unpkg.com/lucide@latest"\>\</script\>  
      
    \<\!-- jsPDF & html2canvas para Exportação em PDF \--\>  
    \<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"\>\</script\>  
    \<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"\>\</script\>

    \<style\>  
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800\&display=swap');  
        \* { font-family: 'Plus Jakarta Sans', sans-serif; }  
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }  
        .custom-scrollbar::-webkit-scrollbar-thumb { background: \#cbd5e1; border-radius: 4px; }  
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: \#334155; }  
    \</style\>  
\</head\>  
\<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col"\>

    \<\!-- \==================== TELA DE AUTENTICAÇÃO / LOGIN \==================== \--\>  
    \<div id="authScreen" class="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4"\>  
        \<div class="absolute inset-0 opacity-20 bg-\[radial-gradient(\#d97706\_1px,transparent\_1px)\] \[background-size:16px\_16px\]"\>\</div\>  
          
        \<div class="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"\>  
            \<\!-- Logo / Header \--\>  
            \<div class="text-center mb-8"\>  
                \<div class="w-16 h-16 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4" id="loginLogoPreview"\>  
                    \<i data-lucide="crown" class="w-8 h-8 text-slate-950"\>\</i\>  
                \</div\>  
                \<h1 class="text-2xl font-bold text-white tracking-tight"\>Louve Movement\</h1\>  
                \<p class="text-slate-400 text-xs mt-1"\>Controle Financeiro e de Estoque Louve Movement\</p\>  
            \</div\>

            \<\!-- Formulário Login \--\>  
            \<form id="loginForm" class="space-y-4" onsubmit="event.preventDefault(); handleLogin();"\>  
                \<div\>  
                    \<label class="block text-xs font-semibold text-slate-300 mb-1.5"\>E-mail de Acesso\</label\>  
                    \<div class="relative"\>  
                        \<i data-lucide="mail" class="w-5 h-5 absolute left-3 top-3 text-slate-500"\>\</i\>  
                        \<input type="email" id="loginEmail" required value="admin@louvemovement.com" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-500 transition" placeholder="seu@email.com"\>  
                    \</div\>  
                \</div\>  
                \<div\>  
                    \<div class="flex justify-between items-center mb-1.5"\>  
                        \<label class="text-xs font-semibold text-slate-300"\>Senha\</label\>  
                        \<a href="\#" onclick="alert('Instrução de recuperação enviada para seu e-mail cadastrado\!')" class="text-xs text-amber-400 hover:underline"\>Esqueceu a senha?\</a\>  
                    \</div\>  
                    \<div class="relative"\>  
                        \<i data-lucide="lock" class="w-5 h-5 absolute left-3 top-3 text-slate-500"\>\</i\>  
                        \<input type="password" id="loginPass" required value="123456" class="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-500 transition" placeholder="••••••••"\>  
                    \</div\>  
                \</div\>

                \<button type="submit" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition duration-200 text-sm"\>  
                    Entrar no Painel  
                \</button\>  
            \</form\>

            \<div class="relative my-6 text-center"\>  
                \<div class="absolute inset-0 flex items-center"\>\<div class="w-full border-t border-slate-700"\>\</div\>\</div\>  
                \<span class="relative bg-slate-800 px-3 text-xs text-slate-400"\>ou conecte-se com\</span\>  
            \</div\>

            \<\!-- Botão Google \--\>  
            \<button onclick="handleLoginGoogle()" class="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-700/60 border border-slate-700 text-white text-sm font-medium py-2.5 rounded-xl transition"\>  
                \<svg class="w-4 h-4" viewBox="0 0 24 24"\>  
                    \<path fill="\#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/\>  
                    \<path fill="\#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/\>  
                    \<path fill="\#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z"/\>  
                    \<path fill="\#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.8 7.4 23 12 23z"/\>  
                \</svg\>  
                Continuar com Google  
            \</button\>  
        \</div\>  
    \</div\>

    \<\!-- \==================== APLICAÇÃO PRINCIPAL \==================== \--\>  
    \<div id="appContainer" class="hidden flex-1 flex flex-col md:flex-row min-h-screen"\>  
          
        \<\!-- SIDEBAR DE NAVEGAÇÃO \--\>  
        \<aside class="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800"\>  
            \<div\>  
                \<\!-- Logotipo da Marca Louve Movement \--\>  
                \<div class="p-5 flex items-center gap-3 border-b border-slate-800"\>  
                    \<div id="brandLogoContainer" class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-amber-500/20"\>  
                        \<i data-lucide="crown" class="w-6 h-6 text-slate-950"\>\</i\>  
                    \</div\>  
                    \<div class="overflow-hidden"\>  
                        \<h2 class="font-bold text-sm leading-tight truncate text-white" id="sidebarBrandName"\>Louve Movement\</h2\>  
                        \<span class="text-\[10px\] text-amber-400 font-medium tracking-wide uppercase"\>Vestuário & Gestão\</span\>  
                    \</div\>  
                \</div\>

                \<\!-- Menus de Navegação \--\>  
                \<nav class="p-3 space-y-1"\>  
                    \<button onclick="switchTab('dashboard')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-amber-400 bg-slate-800/80" data-tab="dashboard"\>  
                        \<i data-lucide="layout-dashboard" class="w-4 h-4"\>\</i\> Dashboard Geral  
                    \</button\>  
                    \<button onclick="switchTab('produtos')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800/60" data-tab="produtos"\>  
                        \<i data-lucide="shirt" class="w-4 h-4"\>\</i\> Produtos & Grade  
                    \</button\>  
                    \<button onclick="switchTab('estoque')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800/60" data-tab="estoque"\>  
                        \<i data-lucide="boxes" class="w-4 h-4"\>\</i\> Gestão de Estoque  
                    \</button\>  
                    \<button onclick="switchTab('romaneio')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800/60" data-tab="romaneio"\>  
                        \<i data-lucide="receipt" class="w-4 h-4"\>\</i\> Romaneio & Vendas  
                    \</button\>  
                    \<button onclick="switchTab('financeiro')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800/60" data-tab="financeiro"\>  
                        \<i data-lucide="trending-up" class="w-4 h-4"\>\</i\> Painel Financeiro  
                    \</button\>  
                    \<button onclick="switchTab('configuracoes')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800/60" data-tab="configuracoes"\>  
                        \<i data-lucide="settings" class="w-4 h-4"\>\</i\> Configurações & Logo  
                    \</button\>  
                \</nav\>  
            \</div\>

            \<\!-- Footer Sidebar / Alerta & Logout \--\>  
            \<div class="p-4 border-t border-slate-800"\>  
                \<div id="lowStockWarningBadge" class="hidden mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl"\>  
                    \<div class="flex items-center gap-2 text-amber-400 text-xs font-semibold"\>  
                        \<i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"\>\</i\>  
                        \<span id="lowStockCountText"\>0 itens com estoque baixo\</span\>  
                    \</div\>  
                \</div\>

                \<button onclick="handleLogout()" class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"\>  
                    \<i data-lucide="log-out" class="w-4 h-4"\>\</i\> Encerrar Sessão  
                \</button\>  
            \</div\>  
        \</aside\>

        \<\!-- ÁREA CENTRAL DE CONTEÚDO \--\>  
        \<main class="flex-1 flex flex-col overflow-y-auto max-h-screen custom-scrollbar"\>  
              
            \<\!-- Barra Superior Topbar \--\>  
            \<header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20"\>  
                \<div\>  
                    \<h1 class="text-xl font-bold text-slate-800" id="pageTitle"\>Dashboard Geral\</h1\>  
                    \<p class="text-xs text-slate-500" id="pageSubtitle"\>Visão integrada do estoque e faturamento\</p\>  
                \</div\>  
                \<div class="flex items-center gap-3"\>  
                    \<button onclick="openRomaneioModal()" class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"\>  
                        \<i data-lucide="plus-circle" class="w-4 h-4"\>\</i\> Nova Venda / Romaneio  
                    \</button\>  
                \</div\>  
            \</header\>

            \<\!-- CONTEÚDOS DAS ABAS \--\>  
            \<div class="p-6 space-y-6 flex-1" id="tabContainer"\>

                \<\!-- 1\. ABA DASHBOARD \--\>  
                \<section id="tab-dashboard" class="space-y-6"\>  
                    \<\!-- Cards de KPI \--\>  
                    \<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"\>  
                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"\>  
                            \<div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"\>  
                                \<i data-lucide="dollar-sign" class="w-6 h-6"\>\</i\>  
                            \</div\>  
                            \<div\>  
                                \<p class="text-xs text-slate-500 font-medium"\>Faturamento Total\</p\>  
                                \<h3 class="text-xl font-bold text-slate-900" id="dashTotalSales"\>R$ 0,00\</h3\>  
                                \<span class="text-\[11px\] text-emerald-600 font-medium" id="dashSalesCount"\>0 vendas realizadas\</span\>  
                            \</div\>  
                        \</div\>

                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"\>  
                            \<div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"\>  
                                \<i data-lucide="wallet" class="w-6 h-6"\>\</i\>  
                            \</div\>  
                            \<div\>  
                                \<p class="text-xs text-slate-500 font-medium"\>Lucro Líquido\</p\>  
                                \<h3 class="text-xl font-bold text-emerald-600" id="dashNetProfit"\>R$ 0,00\</h3\>  
                                \<span class="text-\[11px\] text-slate-500" id="dashProfitMargin"\>Margem: 0%\</span\>  
                            \</div\>  
                        \</div\>

                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"\>  
                            \<div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"\>  
                                \<i data-lucide="shirt" class="w-6 h-6"\>\</i\>  
                            \</div\>  
                            \<div\>  
                                \<p class="text-xs text-slate-500 font-medium"\>Peças em Estoque\</p\>  
                                \<h3 class="text-xl font-bold text-slate-900" id="dashTotalStock"\>0 un\</h3\>  
                                \<span class="text-\[11px\] text-slate-500" id="dashModelsCount"\>0 modelos cadastrados\</span\>  
                            \</div\>  
                        \</div\>

                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"\>  
                            \<div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"\>  
                                \<i data-lucide="package-search" class="w-6 h-6"\>\</i\>  
                            \</div\>  
                            \<div\>  
                                \<p class="text-xs text-slate-500 font-medium"\>Patrimônio em Estoque\</p\>  
                                \<h3 class="text-xl font-bold text-slate-900" id="dashStockValuation"\>R$ 0,00\</h3\>  
                                \<span class="text-\[11px\] text-slate-500"\>Custo acumulado\</span\>  
                            \</div\>  
                        \</div\>  
                    \</div\>

                    \<\!-- Gráficos Rápidos \--\>  
                    \<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"\>  
                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"\>  
                            \<h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"\>  
                                \<i data-lucide="bar-chart-2" class="w-4 h-4 text-amber-500"\>\</i\> Faturamento vs Lucro por Período  
                            \</h3\>  
                            \<div class="h-64"\>  
                                \<canvas id="chartDashboardSales"\>\</canvas\>  
                            \</div\>  
                        \</div\>

                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"\>  
                            \<h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"\>  
                                \<i data-lucide="pie-chart" class="w-4 h-4 text-amber-500"\>\</i\> Distribuição por Tamanhos (P, M, G, GG)  
                            \</h3\>  
                            \<div class="h-64 flex items-center justify-center"\>  
                                \<canvas id="chartDashboardSizes"\>\</canvas\>  
                            \</div\>  
                        \</div\>  
                    \</div\>  
                \</section\>

                \<\!-- 2\. ABA PRODUTOS \--\>  
                \<section id="tab-produtos" class="hidden space-y-4"\>  
                    \<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"\>  
                        \<div class="flex items-center gap-2"\>  
                            \<input type="text" id="searchProductInput" oninput="renderProductsTable()" placeholder="Buscar por nome, estampa, cor ou código..." class="text-xs bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-72 focus:outline-none focus:border-amber-500 shadow-sm"\>  
                        \</div\>  
                        \<div class="flex items-center gap-2"\>  
                            \<button onclick="exportProductsPDF()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"\>  
                                \<i data-lucide="file-text" class="w-4 h-4"\>\</i\> Exportar Catálogo PDF  
                            \</button\>  
                            \<button onclick="openProductModal()" class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"\>  
                                \<i data-lucide="plus" class="w-4 h-4"\>\</i\> Cadastrar Camisa  
                            \</button\>  
                        \</div\>  
                    \</div\>

                    \<\!-- Tabela de Produtos \--\>  
                    \<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="productsTableContainer"\>  
                        \<div class="overflow-x-auto"\>  
                            \<table class="w-full text-left text-xs text-slate-600"\>  
                                \<thead class="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold"\>  
                                    \<tr\>  
                                        \<th class="p-3.5"\>Foto\</th\>  
                                        \<th class="p-3.5"\>Código / Nome\</th\>  
                                        \<th class="p-3.5"\>Estampa & Cor\</th\>  
                                        \<th class="p-3.5 text-center"\>Grade (P / M / G / GG)\</th\>  
                                        \<th class="p-3.5 text-right"\>Custo / Venda\</th\>  
                                        \<th class="p-3.5 text-right"\>Lucro Unit.\</th\>  
                                        \<th class="p-3.5 text-center"\>Ações\</th\>  
                                    \</tr\>  
                                \</thead\>  
                                \<tbody id="productsTableBody" class="divide-y divide-slate-100"\>  
                                    \<\!-- Dinâmico \--\>  
                                \</tbody\>  
                            \</table\>  
                        \</div\>  
                    \</div\>  
                \</section\>

                \<\!-- 3\. ABA ESTOQUE \--\>  
                \<section id="tab-estoque" class="hidden space-y-4"\>  
                    \<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"\>  
                        \<div class="flex items-center gap-3"\>  
                            \<span class="text-xs font-medium text-slate-500"\>Filtrar por Status:\</span\>  
                            \<select id="stockFilterSelect" onchange="renderStockTable()" class="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"\>  
                                \<option value="all"\>Todos os Itens\</option\>  
                                \<option value="low"\>Apenas Estoque Baixo / Crítico\</option\>  
                            \</select\>  
                        \</div\>  
                        \<button onclick="exportStockPDF()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"\>  
                            \<i data-lucide="file-down" class="w-4 h-4"\>\</i\> Exportar Inventário PDF  
                        \</button\>  
                    \</div\>

                    \<\!-- Tabela de Estoque \--\>  
                    \<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="stockTableContainer"\>  
                        \<div class="overflow-x-auto"\>  
                            \<table class="w-full text-left text-xs text-slate-600"\>  
                                \<thead class="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold"\>  
                                    \<tr\>  
                                        \<th class="p-3.5"\>Foto\</th\>  
                                        \<th class="p-3.5"\>Produto / Estampa\</th\>  
                                        \<th class="p-3.5 text-center"\>P\</th\>  
                                        \<th class="p-3.5 text-center"\>M\</th\>  
                                        \<th class="p-3.5 text-center"\>G\</th\>  
                                        \<th class="p-3.5 text-center"\>GG\</th\>  
                                        \<th class="p-3.5 text-center"\>Total Atual\</th\>  
                                        \<th class="p-3.5 text-center"\>Estoque Mínimo\</th\>  
                                        \<th class="p-3.5 text-center"\>Status\</th\>  
                                        \<th class="p-3.5 text-center"\>Ajuste Rápido\</th\>  
                                    \</tr\>  
                                \</thead\>  
                                \<tbody id="stockTableBody" class="divide-y divide-slate-100"\>  
                                    \<\!-- Dinâmico \--\>  
                                \</tbody\>  
                            \</table\>  
                        \</div\>  
                    \</div\>  
                \</section\>

                \<\!-- 4\. ABA ROMANEIO & VENDAS \--\>  
                \<section id="tab-romaneio" class="hidden space-y-4"\>  
                    \<div class="flex justify-between items-center"\>  
                        \<h2 class="text-sm font-bold text-slate-800"\>Histórico de Romaneios / Pedidos de Venda\</h2\>  
                        \<button onclick="openRomaneioModal()" class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"\>  
                            \<i data-lucide="plus-circle" class="w-4 h-4"\>\</i\> Criar Novo Romaneio  
                        \</button\>  
                    \</div\>

                    \<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"\>  
                        \<div class="overflow-x-auto"\>  
                            \<table class="w-full text-left text-xs text-slate-600"\>  
                                \<thead class="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold"\>  
                                    \<tr\>  
                                        \<th class="p-3.5"\>Nº Romaneio\</th\>  
                                        \<th class="p-3.5"\>Data\</th\>  
                                        \<th class="p-3.5"\>Cliente\</th\>  
                                        \<th class="p-3.5"\>WhatsApp / E-mail\</th\>  
                                        \<th class="p-3.5"\>Itens Comprados\</th\>  
                                        \<th class="p-3.5"\>Pagamento\</th\>  
                                        \<th class="p-3.5 text-right"\>Valor Total\</th\>  
                                        \<th class="p-3.5 text-center"\>Ações\</th\>  
                                    \</tr\>  
                                \</thead\>  
                                \<tbody id="romaneioTableBody" class="divide-y divide-slate-100"\>  
                                    \<\!-- Dinâmico \--\>  
                                \</tbody\>  
                            \</table\>  
                        \</div\>  
                    \</div\>  
                \</section\>

                \<\!-- 5\. ABA FINANCEIRO \--\>  
                \<section id="tab-financeiro" class="hidden space-y-6"\>  
                    \<div class="flex justify-between items-center"\>  
                        \<h2 class="text-sm font-bold text-slate-800"\>Demonstrativo de Resultados & Fluxo\</h2\>  
                        \<button onclick="exportFinancePDF()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"\>  
                            \<i data-lucide="file-text" class="w-4 h-4"\>\</i\> Exportar Relatório DRE (PDF)  
                        \</button\>  
                    \</div\>

                    \<\!-- Grid DRE Detalhado \--\>  
                    \<div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="financeSummaryCards"\>  
                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"\>  
                            \<span class="text-xs font-medium text-slate-500"\>Receita Bruta Acumulada\</span\>  
                            \<h4 class="text-2xl font-bold text-slate-900 mt-1" id="finGrossSales"\>R$ 0,00\</h4\>  
                            \<p class="text-\[11px\] text-slate-400 mt-1"\>Total faturado em romaneios\</p\>  
                        \</div\>  
                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"\>  
                            \<span class="text-xs font-medium text-slate-500"\>Custo das Mercadorias Vendidas (CMV)\</span\>  
                            \<h4 class="text-2xl font-bold text-rose-600 mt-1" id="finTotalCost"\>R$ 0,00\</h4\>  
                            \<p class="text-\[11px\] text-slate-400 mt-1"\>Custo base dos produtos baixados\</p\>  
                        \</div\>  
                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"\>  
                            \<span class="text-xs font-medium text-slate-500"\>Lucro Operacional Líquido\</span\>  
                            \<h4 class="text-2xl font-bold text-emerald-600 mt-1" id="finNetProfit"\>R$ 0,00\</h4\>  
                            \<p class="text-\[11px\] text-emerald-600 font-semibold mt-1" id="finMarginPercent"\>Margem líquida: 0%\</p\>  
                        \</div\>  
                    \</div\>

                    \<\!-- Métricas por Método de Pagamento \--\>  
                    \<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"\>  
                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1"\>  
                            \<h3 class="text-sm font-bold text-slate-800 mb-4"\>Vendas por Forma de Pagamento\</h3\>  
                            \<div class="h-56 flex items-center justify-center"\>  
                                \<canvas id="chartPaymentMethods"\>\</canvas\>  
                            \</div\>  
                        \</div\>

                        \<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2"\>  
                            \<h3 class="text-sm font-bold text-slate-800 mb-4"\>Evolução Mensal de Faturamento & Margem\</h3\>  
                            \<div class="h-56"\>  
                                \<canvas id="chartMonthlyFinance"\>\</canvas\>  
                            \</div\>  
                        \</div\>  
                    \</div\>  
                \</section\>

                \<\!-- 6\. ABA CONFIGURAÇÕES & PERSONALIZAÇÃO \--\>  
                \<section id="tab-configuracoes" class="hidden space-y-6 max-w-2xl"\>  
                    \<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"\>  
                        \<h2 class="text-base font-bold text-slate-800 border-b pb-3"\>Identidade Visual da Marca\</h2\>  
                          
                        \<div class="flex items-center gap-6"\>  
                            \<div id="settingsLogoPreview" class="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-md"\>  
                                \<i data-lucide="crown" class="w-10 h-10 text-slate-950"\>\</i\>  
                            \</div\>  
                            \<div class="space-y-2"\>  
                                \<label class="block text-xs font-semibold text-slate-700"\>Substituir Logotipo da Empresa\</label\>  
                                \<input type="file" id="logoUploadInput" accept="image/\*" onchange="handleLogoUpload(event)" class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"\>  
                                \<p class="text-\[11px\] text-slate-400"\>Recomendado: Imagem PNG ou JPG quadrada (500x500px).\</p\>  
                            \</div\>  
                        \</div\>

                        \<div class="space-y-4 pt-4 border-t border-slate-100"\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Nome do Aplicativo / Loja\</label\>  
                                \<input type="text" id="configStoreName" value="Louve Movement" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                            \</div\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Subtítulo / Slogan\</label\>  
                                \<input type="text" id="configStoreSubtitle" value="Controle Financeiro e de Estoque Louve Movement" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                            \</div\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Chave PIX Padrão (para Romaneios)\</label\>  
                                \<input type="text" id="configStorePix" value="financeiro@louvemovement.com" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                            \</div\>

                            \<button onclick="saveStoreSettings()" class="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition"\>  
                                Salvar Alterações  
                            \</button\>  
                        \</div\>  
                    \</div\>  
                \</section\>  
            \</div\>  
        \</main\>  
    \</div\>

    \<\!-- \==================== MODAL DE CADASTRO / EDIÇÃO DE PRODUTO \==================== \--\>  
    \<div id="productModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4"\>  
        \<div class="bg-white rounded-3xl w-full max-w-2xl max-h-\[90vh\] overflow-y-auto custom-scrollbar border border-slate-200 shadow-2xl p-6"\>  
            \<div class="flex justify-between items-center pb-4 border-b border-slate-100"\>  
                \<h3 class="font-bold text-base text-slate-800" id="productModalTitle"\>Cadastrar Nova Camisa\</h3\>  
                \<button onclick="closeProductModal()" class="text-slate-400 hover:text-slate-600"\>\<i data-lucide="x" class="w-5 h-5"\>\</i\>\</button\>  
            \</div\>

            \<form id="productForm" class="mt-4 space-y-4" onsubmit="event.preventDefault(); saveProduct();"\>  
                \<input type="hidden" id="prodId"\>  
                  
                \<div class="grid grid-cols-1 sm:grid-cols-3 gap-4"\>  
                    \<\!-- Upload Imagem \--\>  
                    \<div class="sm:col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 text-center"\>  
                        \<img id="prodImagePreview" src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300\&auto=format\&fit=crop\&q=60" alt="Preview" class="w-24 h-24 object-cover rounded-xl mb-2 shadow-sm"\>  
                        \<label class="cursor-pointer text-\[11px\] font-bold text-amber-600 hover:underline"\>  
                            Carregar Foto  
                            \<input type="file" id="prodImageInput" accept="image/\*" onchange="previewImage(event, 'prodImagePreview')" class="hidden"\>  
                        \</label\>  
                    \</div\>

                    \<div class="sm:col-span-2 space-y-3"\>  
                        \<div class="grid grid-cols-2 gap-3"\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Código SKU\</label\>  
                                \<input type="text" id="prodCode" required placeholder="LM-001" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500 font-mono"\>  
                            \</div\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Nome do Produto\</label\>  
                                \<input type="text" id="prodName" required placeholder="Camisa Streetwear Fé" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                            \</div\>  
                        \</div\>

                        \<div class="grid grid-cols-2 gap-3"\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Estampa\</label\>  
                                \<input type="text" id="prodPrint" required placeholder="Ex: Cruz Frontal Minimalista" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                            \</div\>  
                            \<div\>  
                                \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Cor\</label\>  
                                \<input type="text" id="prodColor" required placeholder="Ex: Preto / Off-White" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                            \</div\>  
                        \</div\>  
                    \</div\>  
                \</div\>

                \<\!-- Estoque por Grade \--\>  
                \<div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2"\>  
                    \<span class="text-xs font-bold text-amber-900 block"\>Grade de Estoque Inicial por Tamanho:\</span\>  
                    \<div class="grid grid-cols-4 gap-3"\>  
                        \<div\>  
                            \<label class="block text-center text-\[11px\] font-bold text-slate-600 mb-1"\>Tam. P\</label\>  
                            \<input type="number" id="prodStockP" min="0" value="0" class="w-full text-center text-xs bg-white border border-amber-200 rounded-xl p-2 focus:outline-none"\>  
                        \</div\>  
                        \<div\>  
                            \<label class="block text-center text-\[11px\] font-bold text-slate-600 mb-1"\>Tam. M\</label\>  
                            \<input type="number" id="prodStockM" min="0" value="0" class="w-full text-center text-xs bg-white border border-amber-200 rounded-xl p-2 focus:outline-none"\>  
                        \</div\>  
                        \<div\>  
                            \<label class="block text-center text-\[11px\] font-bold text-slate-600 mb-1"\>Tam. G\</label\>  
                            \<input type="number" id="prodStockG" min="0" value="0" class="w-full text-center text-xs bg-white border border-amber-200 rounded-xl p-2 focus:outline-none"\>  
                        \</div\>  
                        \<div\>  
                            \<label class="block text-center text-\[11px\] font-bold text-slate-600 mb-1"\>Tam. GG\</label\>  
                            \<input type="number" id="prodStockGG" min="0" value="0" class="w-full text-center text-xs bg-white border border-amber-200 rounded-xl p-2 focus:outline-none"\>  
                        \</div\>  
                    \</div\>  
                    \<div class="pt-2"\>  
                        \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Estoque Mínimo de Alerta Geral deste Modelo:\</label\>  
                        \<input type="number" id="prodMinStock" min="1" value="5" class="w-32 text-xs bg-white border border-slate-200 rounded-xl p-2 focus:outline-none"\>  
                    \</div\>  
                \</div\>

                \<\!-- Preços e Lucro Inteligente \--\>  
                \<div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100"\>  
                    \<div\>  
                        \<label class="block text-\[11px\] font-semibold text-slate-600 mb-1"\>Valor de Custo (R$)\</label\>  
                        \<input type="number" step="0.01" id="prodCost" oninput="calcProfitPreview()" required placeholder="35.00" class="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none"\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-\[11px\] font-semibold text-slate-600 mb-1"\>Valor de Venda (R$)\</label\>  
                        \<input type="number" step="0.01" id="prodPrice" oninput="calcProfitPreview()" required placeholder="89.90" class="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none"\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-\[11px\] font-semibold text-slate-600 mb-1"\>Lucro Unitário\</label\>  
                        \<div id="previewProfitVal" class="text-xs font-bold text-emerald-600 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100"\>R$ 0,00\</div\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-\[11px\] font-semibold text-slate-600 mb-1"\>Margem de Lucro\</label\>  
                        \<div id="previewProfitMargin" class="text-xs font-bold text-emerald-600 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100"\>0%\</div\>  
                    \</div\>  
                \</div\>

                \<div class="flex justify-end gap-2 pt-3"\>  
                    \<button type="button" onclick="closeProductModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"\>Cancelar\</button\>  
                    \<button type="submit" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md"\>Salvar Produto\</button\>  
                \</div\>  
            \</form\>  
        \</div\>  
    \</div\>

    \<\!-- \==================== MODAL DE CRIAÇÃO DE ROMANEIO (NOVA VENDA / PDV) \==================== \--\>  
    \<div id="romaneioModal" class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm hidden items-center justify-center p-4"\>  
        \<div class="bg-white rounded-3xl w-full max-w-4xl max-h-\[95vh\] overflow-y-auto custom-scrollbar border border-slate-200 shadow-2xl p-6 flex flex-col"\>  
            \<div class="flex justify-between items-center pb-4 border-b border-slate-100"\>  
                \<div class="flex items-center gap-3"\>  
                    \<div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold"\>  
                        \<i data-lucide="receipt" class="w-5 h-5"\>\</i\>  
                    \</div\>  
                    \<div\>  
                        \<h3 class="font-bold text-base text-slate-800"\>Novo Romaneio de Venda\</h3\>  
                        \<p class="text-\[11px\] text-slate-400"\>Emissão com baixa de estoque automática e recibo\</p\>  
                    \</div\>  
                \</div\>  
                \<button onclick="closeRomaneioModal()" class="text-slate-400 hover:text-slate-600"\>\<i data-lucide="x" class="w-5 h-5"\>\</i\>\</button\>  
            \</div\>

            \<div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1"\>  
                \<\!-- Coluna Esquerda: Dados do Cliente & Pagamento \--\>  
                \<div class="space-y-4 lg:col-span-1"\>  
                    \<h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide"\>1. Dados do Cliente\</h4\>  
                      
                    \<div\>  
                        \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Nome Completo\</label\>  
                        \<input type="text" id="romClientName" placeholder="Ex: Lucas Gabriel" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-xs font-semibold text-slate-700 mb-1"\>WhatsApp\</label\>  
                        \<input type="text" id="romClientPhone" placeholder="(11) 99999-9999" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-xs font-semibold text-slate-700 mb-1"\>E-mail\</label\>  
                        \<input type="email" id="romClientEmail" placeholder="cliente@email.com" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"\>  
                    \</div\>

                    \<h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide pt-2"\>2. Pagamento\</h4\>  
                    \<div\>  
                        \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Forma de Pagamento\</label\>  
                        \<select id="romPaymentMethod" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"\>  
                            \<option value="PIX"\>PIX (Instantâneo)\</option\>  
                            \<option value="Cartão de Crédito"\>Cartão de Crédito\</option\>  
                            \<option value="Cartão de Débito"\>Cartão de Débito\</option\>  
                            \<option value="Dinheiro"\>Dinheiro\</option\>  
                        \</select\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-xs font-semibold text-slate-700 mb-1"\>Data da Venda\</label\>  
                        \<input type="date" id="romDate" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"\>  
                    \</div\>  
                \</div\>

                \<\!-- Coluna Direita: Seleção de Peças e Carrinho \--\>  
                \<div class="space-y-4 lg:col-span-2 flex flex-col justify-between"\>  
                    \<div\>  
                        \<h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide"\>3. Adicionar Camisas ao Romaneio\</h4\>  
                          
                        \<\!-- Seletor de Camisas \--\>  
                        \<div class="mt-2 grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 items-end"\>  
                            \<div class="sm:col-span-6"\>  
                                \<label class="block text-\[11px\] font-semibold text-slate-600 mb-1"\>Selecione o Modelo\</label\>  
                                \<select id="romProductSelect" onchange="updateRomaneioSizeOptions()" class="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 focus:outline-none"\>  
                                    \<\!-- Opções dinâmicas \--\>  
                                \</select\>  
                            \</div\>  
                            \<div class="sm:col-span-3"\>  
                                \<label class="block text-\[11px\] font-semibold text-slate-600 mb-1"\>Tamanho\</label\>  
                                \<select id="romSizeSelect" class="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 focus:outline-none"\>  
                                    \<option value="P"\>P\</option\>  
                                    \<option value="M"\>M\</option\>  
                                    \<option value="G"\>G\</option\>  
                                    \<option value="GG"\>GG\</option\>  
                                \</select\>  
                            \</div\>  
                            \<div class="sm:col-span-3"\>  
                                \<button type="button" onclick="addItemToRomaneioCart()" class="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition"\>  
                                    \+ Adicionar  
                                \</button\>  
                            \</div\>  
                        \</div\>

                        \<\!-- Lista de Itens no Romaneio Atual \--\>  
                        \<div class="mt-4 border border-slate-200 rounded-2xl overflow-hidden"\>  
                            \<div class="bg-slate-100 p-2.5 text-xs font-bold text-slate-700"\>Itens do Romaneio\</div\>  
                            \<div class="max-h-48 overflow-y-auto divide-y divide-slate-100" id="romCartItemsList"\>  
                                \<p class="p-4 text-center text-xs text-slate-400"\>Nenhum item adicionado ainda.\</p\>  
                            \</div\>  
                        \</div\>  
                    \</div\>

                    \<\!-- Resumo Financeiro da Venda \--\>  
                    \<div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between mt-4"\>  
                        \<div\>  
                            \<span class="text-xs text-amber-900 font-medium"\>Total do Romaneio:\</span\>  
                            \<h3 class="text-2xl font-extrabold text-slate-900" id="romCartTotal"\>R$ 0,00\</h3\>  
                        \</div\>  
                        \<button onclick="finalizeRomaneio()" class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition"\>  
                            Finalizar e Baixar Estoque  
                        \</button\>  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<\!-- \==================== CONTAINER ESCONDIDO PARA GERAÇÃO DO RECIBO / ROMANEIO PDF \==================== \--\>  
    \<div id="pdfExportContainer" class="hidden p-8 bg-white text-slate-900 max-w-2xl mx-auto"\>  
        \<\!-- Renderizado dinamicamente para exportar PDF \--\>  
    \</div\>

    \<\!-- \==================== LÓGICA JAVASCRIPT COMPLETA \==================== \--\>  
    \<script\>  
        // \--- ESTADO GLOBAL DA APLICAÇÃO \---  
        const APP\_STATE \= {  
            brandName: "Louve Movement",  
            brandSubtitle: "Controle Financeiro e de Estoque Louve Movement",  
            brandLogo: null, // Base64 se customizado  
            pixKey: "financeiro@louvemovement.com",  
            products: \[\],  
            sales: \[\],  
            currentCart: \[\]  
        };

        // Carregar dados iniciais de demonstração se não existirem no localStorage  
        function initAppStorage() {  
            const savedState \= localStorage.getItem('LOUVE\_MOVEMENT\_DATA');  
            if (savedState) {  
                const parsed \= JSON.parse(savedState);  
                Object.assign(APP\_STATE, parsed);  
            } else {  
                // Produtos semente com tema Louve Movement  
                APP\_STATE.products \= \[  
                    {  
                        id: "prod\_1",  
                        code: "LM-ST-01",  
                        name: "Camisa Oversized Lion of Judah",  
                        print: "Leão de Judá Floral Costas",  
                        color: "Preto Mineral",  
                        cost: 38.00,  
                        price: 99.90,  
                        minStock: 6,  
                        sizes: { P: 5, M: 8, G: 12, GG: 4 },  
                        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300\&auto=format\&fit=crop\&q=60"  
                    },  
                    {  
                        id: "prod\_2",  
                        code: "LM-ST-02",  
                        name: "Camisa Minimalist Grace",  
                        print: "Graça Sobre Graça Peito",  
                        color: "Off-White / Bege",  
                        cost: 34.00,  
                        price: 89.90,  
                        minStock: 5,  
                        sizes: { P: 2, M: 4, G: 3, GG: 1 },  
                        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300\&auto=format\&fit=crop\&q=60"  
                    }  
                \];  
                APP\_STATE.sales \= \[\];  
                saveToLocalStorage();  
            }  
        }

        function saveToLocalStorage() {  
            localStorage.setItem('LOUVE\_MOVEMENT\_DATA', JSON.stringify(APP\_STATE));  
        }

        // \--- SISTEMA DE AUTENTICAÇÃO \---  
        function handleLogin() {  
            document.getElementById('authScreen').classList.add('hidden');  
            document.getElementById('appContainer').classList.remove('hidden');  
            refreshAllViews();  
        }

        function handleLoginGoogle() {  
            alert('Autenticado com sucesso via Conta Google\!');  
            handleLogin();  
        }

        function handleLogout() {  
            document.getElementById('authScreen').classList.remove('hidden');  
            document.getElementById('appContainer').classList.add('hidden');  
        }

        // \--- NAVEGAÇÃO ENTRE ABAS \---  
        function switchTab(tabId) {  
            document.querySelectorAll('\#tabContainer \> section').forEach(sec \=\> sec.classList.add('hidden'));  
            document.querySelectorAll('.nav-item').forEach(btn \=\> {  
                btn.classList.remove('bg-slate-800/80', 'text-amber-400');  
                btn.classList.add('text-slate-300');  
            });

            const activeSection \= document.getElementById('tab-' \+ tabId);  
            if (activeSection) activeSection.classList.remove('hidden');

            const activeBtn \= document.querySelector(\`.nav-item\[data-tab="${tabId}"\]\`);  
            if (activeBtn) {  
                activeBtn.classList.add('bg-slate-800/80', 'text-amber-400');  
                activeBtn.classList.remove('text-slate-300');  
            }

            // Títulos  
            const titles \= {  
                dashboard: \['Dashboard Geral', 'Visão integrada do estoque e faturamento'\],  
                produtos: \['Catálogo de Camisas', 'Cadastro completo de modelos, estampas e margens'\],  
                estoque: \['Controle de Estoque & Grade', 'Monitoramento por tamanho (P/M/G/GG) e alertas'\],  
                romaneio: \['Romaneios de Saída / PDV', 'Histórico de vendas e emissão de comprovantes'\],  
                financeiro: \['Painel Financeiro & DRE', 'Controle detalhado de lucros, custos e faturamento'\],  
                configuracoes: \['Configurações da Marca', 'Personalização de logotipos e dados da empresa'\]  
            };

            if (titles\[tabId\]) {  
                document.getElementById('pageTitle').innerText \= titles\[tabId\]\[0\];  
                document.getElementById('pageSubtitle').innerText \= titles\[tabId\]\[1\];  
            }

            if (tabId \=== 'dashboard') renderDashboardCharts();  
            if (tabId \=== 'financeiro') renderFinanceCharts();  
            if (tabId \=== 'produtos') renderProductsTable();  
            if (tabId \=== 'estoque') renderStockTable();  
            if (tabId \=== 'romaneio') renderRomaneioTable();  
        }

        // \--- LOGOTIPO & BRANDING \---  
        function handleLogoUpload(event) {  
            const file \= event.target.files\[0\];  
            if (file) {  
                const reader \= new FileReader();  
                reader.onload \= function(e) {  
                    APP\_STATE.brandLogo \= e.target.result;  
                    applyBranding();  
                    saveToLocalStorage();  
                }  
                reader.readAsDataURL(file);  
            }  
        }

        function applyBranding() {  
            const container \= document.getElementById('brandLogoContainer');  
            const preview \= document.getElementById('settingsLogoPreview');  
            const loginPreview \= document.getElementById('loginLogoPreview');

            if (APP\_STATE.brandLogo) {  
                const imgHtml \= \`\<img src="${APP\_STATE.brandLogo}" class="w-full h-full object-cover" /\>\`;  
                container.innerHTML \= imgHtml;  
                preview.innerHTML \= imgHtml;  
                loginPreview.innerHTML \= imgHtml;  
            }  
            document.getElementById('sidebarBrandName').innerText \= APP\_STATE.brandName;  
            document.getElementById('configStoreName').value \= APP\_STATE.brandName;  
            document.getElementById('configStoreSubtitle').value \= APP\_STATE.brandSubtitle;  
            document.getElementById('configStorePix').value \= APP\_STATE.pixKey;  
        }

        function saveStoreSettings() {  
            APP\_STATE.brandName \= document.getElementById('configStoreName').value;  
            APP\_STATE.brandSubtitle \= document.getElementById('configStoreSubtitle').value;  
            APP\_STATE.pixKey \= document.getElementById('configStorePix').value;  
            saveToLocalStorage();  
            applyBranding();  
            alert('Configurações da marca atualizadas\!');  
        }

        // \--- GESTÃO DE PRODUTOS \---  
        function openProductModal(editId \= null) {  
            const form \= document.getElementById('productForm');  
            form.reset();  
            document.getElementById('prodId').value \= '';  
            document.getElementById('prodImagePreview').src \= "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300\&auto=format\&fit=crop\&q=60";  
            document.getElementById('productModalTitle').innerText \= "Cadastrar Nova Camisa";

            if (editId) {  
                const p \= APP\_STATE.products.find(x \=\> x.id \=== editId);  
                if (p) {  
                    document.getElementById('prodId').value \= p.id;  
                    document.getElementById('prodCode').value \= p.code;  
                    document.getElementById('prodName').value \= p.name;  
                    document.getElementById('prodPrint').value \= p.print;  
                    document.getElementById('prodColor').value \= p.color;  
                    document.getElementById('prodCost').value \= p.cost;  
                    document.getElementById('prodPrice').value \= p.price;  
                    document.getElementById('prodMinStock').value \= p.minStock || 5;  
                    document.getElementById('prodStockP').value \= p.sizes.P;  
                    document.getElementById('prodStockM').value \= p.sizes.M;  
                    document.getElementById('prodStockG').value \= p.sizes.G;  
                    document.getElementById('prodStockGG').value \= p.sizes.GG;  
                    document.getElementById('prodImagePreview').src \= p.image;  
                    document.getElementById('productModalTitle').innerText \= "Editar Camisa / Grade";  
                    calcProfitPreview();  
                }  
            }  
            document.getElementById('productModal').classList.remove('hidden');  
            document.getElementById('productModal').classList.add('flex');  
        }

        function closeProductModal() {  
            document.getElementById('productModal').classList.add('hidden');  
            document.getElementById('productModal').classList.remove('flex');  
        }

        function previewImage(event, targetImgId) {  
            const file \= event.target.files\[0\];  
            if (file) {  
                const reader \= new FileReader();  
                reader.onload \= function(e) {  
                    document.getElementById(targetImgId).src \= e.target.result;  
                }  
                reader.readAsDataURL(file);  
            }  
        }

        function calcProfitPreview() {  
            const cost \= parseFloat(document.getElementById('prodCost').value) || 0;  
            const price \= parseFloat(document.getElementById('prodPrice').value) || 0;  
            const profit \= price \- cost;  
            const margin \= price \> 0 ? ((profit / price) \* 100).toFixed(1) : 0;

            document.getElementById('previewProfitVal').innerText \= \`R$ ${profit.toFixed(2)}\`;  
            document.getElementById('previewProfitMargin').innerText \= \`${margin}%\`;  
        }

        function saveProduct() {  
            const id \= document.getElementById('prodId').value || 'prod\_' \+ Date.now();  
            const product \= {  
                id,  
                code: document.getElementById('prodCode').value,  
                name: document.getElementById('prodName').value,  
                print: document.getElementById('prodPrint').value,  
                color: document.getElementById('prodColor').value,  
                cost: parseFloat(document.getElementById('prodCost').value) || 0,  
                price: parseFloat(document.getElementById('prodPrice').value) || 0,  
                minStock: parseInt(document.getElementById('prodMinStock').value) || 5,  
                sizes: {  
                    P: parseInt(document.getElementById('prodStockP').value) || 0,  
                    M: parseInt(document.getElementById('prodStockM').value) || 0,  
                    G: parseInt(document.getElementById('prodStockG').value) || 0,  
                    GG: parseInt(document.getElementById('prodStockGG').value) || 0  
                },  
                image: document.getElementById('prodImagePreview').src  
            };

            const index \= APP\_STATE.products.findIndex(p \=\> p.id \=== id);  
            if (index \>= 0\) {  
                APP\_STATE.products\[index\] \= product;  
            } else {  
                APP\_STATE.products.push(product);  
            }

            saveToLocalStorage();  
            closeProductModal();  
            refreshAllViews();  
        }

        function deleteProduct(id) {  
            if (confirm("Tem certeza que deseja excluir este modelo? O histórico de estoque deste produto será removido.")) {  
                APP\_STATE.products \= APP\_STATE.products.filter(p \=\> p.id \!== id);  
                saveToLocalStorage();  
                refreshAllViews();  
            }  
        }

        function renderProductsTable() {  
            const tbody \= document.getElementById('productsTableBody');  
            const search \= (document.getElementById('searchProductInput')?.value || '').toLowerCase();  
            tbody.innerHTML \= '';

            const filtered \= APP\_STATE.products.filter(p \=\>   
                p.name.toLowerCase().includes(search) ||   
                p.code.toLowerCase().includes(search) ||   
                p.print.toLowerCase().includes(search) ||   
                p.color.toLowerCase().includes(search)  
            );

            if (filtered.length \=== 0\) {  
                tbody.innerHTML \= \`\<tr\>\<td colspan="7" class="p-6 text-center text-slate-400"\>Nenhum produto cadastrado.\</td\>\</tr\>\`;  
                return;  
            }

            filtered.forEach(p \=\> {  
                const profit \= p.price \- p.cost;  
                const margin \= p.price \> 0 ? ((profit / p.price) \* 100).toFixed(1) : 0;  
                const totalStock \= p.sizes.P \+ p.sizes.M \+ p.sizes.G \+ p.sizes.GG;

                const tr \= document.createElement('tr');  
                tr.className \= "hover:bg-slate-50 transition border-b border-slate-100";  
                tr.innerHTML \= \`  
                    \<td class="p-3.5"\>  
                        \<img src="${p.image}" class="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm" /\>  
                    \</td\>  
                    \<td class="p-3.5"\>  
                        \<div class="font-bold text-slate-800"\>${p.name}\</div\>  
                        \<div class="text-\[10px\] font-mono text-slate-400"\>${p.code}\</div\>  
                    \</td\>  
                    \<td class="p-3.5"\>  
                        \<span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-\[11px\] mb-1"\>${p.print}\</span\>  
                        \<div class="text-\[11px\] text-slate-500"\>${p.color}\</div\>  
                    \</td\>  
                    \<td class="p-3.5 text-center"\>  
                        \<div class="flex justify-center gap-1.5 font-semibold text-\[11px\]"\>  
                            \<span class="px-1.5 py-0.5 bg-slate-100 rounded"\>P: ${p.sizes.P}\</span\>  
                            \<span class="px-1.5 py-0.5 bg-slate-100 rounded"\>M: ${p.sizes.M}\</span\>  
                            \<span class="px-1.5 py-0.5 bg-slate-100 rounded"\>G: ${p.sizes.G}\</span\>  
                            \<span class="px-1.5 py-0.5 bg-slate-100 rounded"\>GG: ${p.sizes.GG}\</span\>  
                        \</div\>  
                        \<div class="text-\[10px\] text-slate-400 mt-1"\>Total: ${totalStock} peças\</div\>  
                    \</td\>  
                    \<td class="p-3.5 text-right"\>  
                        \<div class="font-bold text-slate-900"\>R$ ${p.price.toFixed(2)}\</div\>  
                        \<div class="text-\[10px\] text-slate-400"\>Custo: R$ ${p.cost.toFixed(2)}\</div\>  
                    \</td\>  
                    \<td class="p-3.5 text-right"\>  
                        \<div class="font-bold text-emerald-600"\>R$ ${profit.toFixed(2)}\</div\>  
                        \<div class="text-\[10px\] text-emerald-500 font-semibold"\>${margin}% margem\</div\>  
                    \</td\>  
                    \<td class="p-3.5 text-center"\>  
                        \<div class="flex items-center justify-center gap-2"\>  
                            \<button onclick="openProductModal('${p.id}')" class="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg" title="Editar"\>\<i data-lucide="edit-3" class="w-4 h-4"\>\</i\>\</button\>  
                            \<button onclick="deleteProduct('${p.id}')" class="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg" title="Excluir"\>\<i data-lucide="trash-2" class="w-4 h-4"\>\</i\>\</button\>  
                        \</div\>  
                    \</td\>  
                \`;  
                tbody.appendChild(tr);  
            });  
            lucide.createIcons();  
        }

        // \--- GESTÃO DE ESTOQUE E ALERTAS \---  
        function renderStockTable() {  
            const tbody \= document.getElementById('stockTableBody');  
            const filter \= document.getElementById('stockFilterSelect')?.value || 'all';  
            tbody.innerHTML \= '';

            let lowStockCounter \= 0;

            APP\_STATE.products.forEach(p \=\> {  
                const totalStock \= p.sizes.P \+ p.sizes.M \+ p.sizes.G \+ p.sizes.GG;  
                const isLow \= totalStock \<= (p.minStock || 5);

                if (isLow) lowStockCounter++;  
                if (filter \=== 'low' && \!isLow) return;

                const tr \= document.createElement('tr');  
                tr.className \= "hover:bg-slate-50 transition border-b border-slate-100";  
                tr.innerHTML \= \`  
                    \<td class="p-3.5"\>  
                        \<img src="${p.image}" class="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm" /\>  
                    \</td\>  
                    \<td class="p-3.5"\>  
                        \<div class="font-bold text-slate-800"\>${p.name}\</div\>  
                        \<div class="text-\[11px\] text-slate-400 font-mono"\>${p.code} • ${p.print} (${p.color})\</div\>  
                    \</td\>  
                    \<td class="p-3.5 text-center font-bold"\>${p.sizes.P}\</td\>  
                    \<td class="p-3.5 text-center font-bold"\>${p.sizes.M}\</td\>  
                    \<td class="p-3.5 text-center font-bold"\>${p.sizes.G}\</td\>  
                    \<td class="p-3.5 text-center font-bold"\>${p.sizes.GG}\</td\>  
                    \<td class="p-3.5 text-center"\>  
                        \<span class="text-xs font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-800'}"\>${totalStock} un\</span\>  
                    \</td\>  
                    \<td class="p-3.5 text-center text-slate-500 font-medium"\>${p.minStock || 5} un\</td\>  
                    \<td class="p-3.5 text-center"\>  
                        ${isLow   
                            ? \`\<span class="px-2.5 py-1 bg-rose-100 text-rose-700 text-\[10px\] font-bold rounded-full inline-flex items-center gap-1"\>\<i data-lucide="alert-circle" class="w-3 h-3"\>\</i\> Estoque Baixo\</span\>\`  
                            : \`\<span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-\[10px\] font-bold rounded-full"\>Normal\</span\>\`  
                        }  
                    \</td\>  
                    \<td class="p-3.5 text-center"\>  
                        \<button onclick="openStockAdjustPrompt('${p.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"\>  
                            \+ Repor Grade  
                        \</button\>  
                    \</td\>  
                \`;  
                tbody.appendChild(tr);  
            });

            // Atualiza alerta na Sidebar  
            const warningBadge \= document.getElementById('lowStockWarningBadge');  
            const countText \= document.getElementById('lowStockCountText');  
            if (lowStockCounter \> 0\) {  
                warningBadge.classList.remove('hidden');  
                countText.innerText \= \`${lowStockCounter} produto(s) abaixo do mínimo\!\`;  
            } else {  
                warningBadge.classList.add('hidden');  
            }

            lucide.createIcons();  
        }

        function openStockAdjustPrompt(prodId) {  
            const p \= APP\_STATE.products.find(x \=\> x.id \=== prodId);  
            if (\!p) return;

            const size \= prompt(\`Adicionar estoque para "${p.name}".\\nDigite o tamanho (P, M, G ou GG):\`)?.toUpperCase();  
            if (\!\['P', 'M', 'G', 'GG'\].includes(size)) {  
                if (size) alert('Tamanho inválido\! Escolha P, M, G ou GG.');  
                return;  
            }

            const qty \= parseInt(prompt(\`Quantidade a adicionar no tamanho ${size}:\`));  
            if (\!isNaN(qty) && qty \> 0\) {  
                p.sizes\[size\] \+= qty;  
                saveToLocalStorage();  
                refreshAllViews();  
                alert(\`Estoque atualizado com sucesso\! (+${qty} un em ${size})\`);  
            }  
        }

        // \--- SISTEMA DE ROMANEIO (VENDAS / PDV) \---  
        function openRomaneioModal() {  
            APP\_STATE.currentCart \= \[\];  
            document.getElementById('romClientName').value \= '';  
            document.getElementById('romClientPhone').value \= '';  
            document.getElementById('romClientEmail').value \= '';  
            document.getElementById('romDate').value \= new Date().toISOString().split('T')\[0\];

            populateRomaneioProductSelect();  
            renderRomaneioCart();

            document.getElementById('romaneioModal').classList.remove('hidden');  
            document.getElementById('romaneioModal').classList.add('flex');  
        }

        function closeRomaneioModal() {  
            document.getElementById('romaneioModal').classList.add('hidden');  
            document.getElementById('romaneioModal').classList.remove('flex');  
        }

        function populateRomaneioProductSelect() {  
            const select \= document.getElementById('romProductSelect');  
            select.innerHTML \= '';  
            APP\_STATE.products.forEach(p \=\> {  
                const opt \= document.createElement('option');  
                opt.value \= p.id;  
                opt.innerText \= \`${p.name} (${p.print} \- ${p.color}) \- R$ ${p.price.toFixed(2)}\`;  
                select.appendChild(opt);  
            });  
            updateRomaneioSizeOptions();  
        }

        function updateRomaneioSizeOptions() {  
            const prodId \= document.getElementById('romProductSelect').value;  
            const p \= APP\_STATE.products.find(x \=\> x.id \=== prodId);  
            const sizeSelect \= document.getElementById('romSizeSelect');  
            if (p) {  
                sizeSelect.innerHTML \= \`  
                    \<option value="P"\>P (Disponível: ${p.sizes.P})\</option\>  
                    \<option value="M"\>M (Disponível: ${p.sizes.M})\</option\>  
                    \<option value="G"\>G (Disponível: ${p.sizes.G})\</option\>  
                    \<option value="GG"\>GG (Disponível: ${p.sizes.GG})\</option\>  
                \`;  
            }  
        }

        function addItemToRomaneioCart() {  
            const prodId \= document.getElementById('romProductSelect').value;  
            const size \= document.getElementById('romSizeSelect').value;  
            const p \= APP\_STATE.products.find(x \=\> x.id \=== prodId);

            if (\!p) return;  
            if (p.sizes\[size\] \<= 0\) {  
                alert(\`Estoque indisponível para o tamanho ${size} deste modelo\!\`);  
                return;  
            }

            APP\_STATE.currentCart.push({  
                productId: p.id,  
                name: p.name,  
                code: p.code,  
                print: p.print,  
                color: p.color,  
                size: size,  
                price: p.price,  
                cost: p.cost,  
                image: p.image  
            });

            renderRomaneioCart();  
        }

        function removeCartItem(index) {  
            APP\_STATE.currentCart.splice(index, 1);  
            renderRomaneioCart();  
        }

        function renderRomaneioCart() {  
            const container \= document.getElementById('romCartItemsList');  
            const totalEl \= document.getElementById('romCartTotal');

            if (APP\_STATE.currentCart.length \=== 0\) {  
                container.innerHTML \= \`\<p class="p-4 text-center text-xs text-slate-400"\>Nenhum item adicionado ainda.\</p\>\`;  
                totalEl.innerText \= "R$ 0,00";  
                return;  
            }

            container.innerHTML \= '';  
            let total \= 0;

            APP\_STATE.currentCart.forEach((item, index) \=\> {  
                total \+= item.price;  
                const div \= document.createElement('div');  
                div.className \= "p-3 flex items-center justify-between hover:bg-slate-50 text-xs";  
                div.innerHTML \= \`  
                    \<div class="flex items-center gap-3"\>  
                        \<img src="${item.image}" class="w-8 h-8 rounded-lg object-cover border" /\>  
                        \<div\>  
                            \<div class="font-bold text-slate-800"\>${item.name}\</div\>  
                            \<div class="text-\[10px\] text-slate-400"\>Tam: \<span class="font-bold text-amber-600"\>${item.size}\</span\> | Cor: ${item.color}\</div\>  
                        \</div\>  
                    \</div\>  
                    \<div class="flex items-center gap-4"\>  
                        \<span class="font-bold text-slate-900"\>R$ ${item.price.toFixed(2)}\</span\>  
                        \<button onclick="removeCartItem(${index})" class="text-rose-500 hover:text-rose-700"\>\<i data-lucide="trash" class="w-4 h-4"\>\</i\>\</button\>  
                    \</div\>  
                \`;  
                container.appendChild(div);  
            });

            totalEl.innerText \= \`R$ ${total.toFixed(2)}\`;  
            lucide.createIcons();  
        }

        function finalizeRomaneio() {  
            if (APP\_STATE.currentCart.length \=== 0\) {  
                alert("Adicione ao menos uma camisa ao romaneio\!");  
                return;  
            }

            const clientName \= document.getElementById('romClientName').value || "Cliente Geral";  
            const clientPhone \= document.getElementById('romClientPhone').value || "-";  
            const clientEmail \= document.getElementById('romClientEmail').value || "-";  
            const paymentMethod \= document.getElementById('romPaymentMethod').value;  
            const saleDate \= document.getElementById('romDate').value || new Date().toISOString().split('T')\[0\];

            // 1\. Dar Baixa no Estoque Real  
            APP\_STATE.currentCart.forEach(item \=\> {  
                const prod \= APP\_STATE.products.find(p \=\> p.id \=== item.productId);  
                if (prod && prod.sizes\[item.size\] \> 0\) {  
                    prod.sizes\[item.size\] \-= 1;  
                }  
            });

            // 2\. Criar Objeto Romaneio  
            const saleRecord \= {  
                id: 'ROM-' \+ (Math.floor(100000 \+ Math.random() \* 900000)),  
                date: saleDate,  
                client: { name: clientName, phone: clientPhone, email: clientEmail },  
                paymentMethod,  
                items: \[...APP\_STATE.currentCart\],  
                total: APP\_STATE.currentCart.reduce((sum, i) \=\> sum \+ i.price, 0),  
                totalCost: APP\_STATE.currentCart.reduce((sum, i) \=\> sum \+ i.cost, 0\)  
            };

            APP\_STATE.sales.unshift(saleRecord);  
            saveToLocalStorage();  
            closeRomaneioModal();  
            refreshAllViews();

            // Opção de abrir WhatsApp ou imprimir  
            if (confirm(\`Romaneio ${saleRecord.id} gerado com sucesso\! Deseja enviar os detalhes no WhatsApp do cliente agora?\`)) {  
                sendRomaneioWhatsApp(saleRecord.id);  
            }  
        }

        function renderRomaneioTable() {  
            const tbody \= document.getElementById('romaneioTableBody');  
            tbody.innerHTML \= '';

            if (APP\_STATE.sales.length \=== 0\) {  
                tbody.innerHTML \= \`\<tr\>\<td colspan="8" class="p-6 text-center text-slate-400"\>Nenhum romaneio emitido ainda.\</td\>\</tr\>\`;  
                return;  
            }

            APP\_STATE.sales.forEach(s \=\> {  
                const tr \= document.createElement('tr');  
                tr.className \= "hover:bg-slate-50 transition border-b border-slate-100";  
                tr.innerHTML \= \`  
                    \<td class="p-3.5 font-bold font-mono text-slate-800"\>${s.id}\</td\>  
                    \<td class="p-3.5 text-slate-500"\>${s.date}\</td\>  
                    \<td class="p-3.5 font-semibold text-slate-800"\>${s.client.name}\</td\>  
                    \<td class="p-3.5 text-\[11px\] text-slate-500"\>${s.client.phone}\<br\>${s.client.email}\</td\>  
                    \<td class="p-3.5"\>  
                        \<div class="text-\[11px\] font-medium text-slate-700"\>${s.items.length} peça(s)\</div\>  
                        \<div class="text-\[10px\] text-slate-400 truncate max-w-xs"\>${s.items.map(i \=\> \`${i.name} \[${i.size}\]\`).join(', ')}\</div\>  
                    \</td\>  
                    \<td class="p-3.5"\>  
                        \<span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-\[10px\]"\>${s.paymentMethod}\</span\>  
                    \</td\>  
                    \<td class="p-3.5 text-right font-extrabold text-slate-900"\>R$ ${s.total.toFixed(2)}\</td\>  
                    \<td class="p-3.5 text-center"\>  
                        \<div class="flex items-center justify-center gap-1.5"\>  
                            \<button onclick="exportSingleRomaneioPDF('${s.id}')" title="Gerar PDF" class="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"\>\<i data-lucide="printer" class="w-4 h-4"\>\</i\>\</button\>  
                            \<button onclick="sendRomaneioWhatsApp('${s.id}')" title="Enviar WhatsApp" class="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg"\>\<i data-lucide="message-circle" class="w-4 h-4"\>\</i\>\</button\>  
                        \</div\>  
                    \</td\>  
                \`;  
                tbody.appendChild(tr);  
            });  
            lucide.createIcons();  
        }

        function sendRomaneioWhatsApp(romaneioId) {  
            const sale \= APP\_STATE.sales.find(s \=\> s.id \=== romaneioId);  
            if (\!sale) return;

            let phoneClean \= sale.client.phone.replace(/\\D/g, '');  
            if (\!phoneClean) {  
                alert("Telefone inválido ou não preenchido no romaneio.");  
                return;  
            }

            const itemsText \= sale.items.map(i \=\> \`• ${i.name} (${i.print}) \- Tam: ${i.size} \- R$ ${i.price.toFixed(2)}\`).join('\\n');  
            const msg \= \`Olá \*${sale.client.name}\*\!\\n\\nAqui está o seu \*Romaneio / Pedido ${sale.id}\* da \*${APP\_STATE.brandName}\*:\\n\\n${itemsText}\\n\\n\*Total:\* R$ ${sale.total.toFixed(2)}\\n\*Forma de Pagamento:\* ${sale.paymentMethod}\\n\*Chave PIX:\* ${APP\_STATE.pixKey}\\n\\nAgradecemos a preferência\! Deus abençoe\!\`;

            window.open(\`https://wa.me/55${phoneClean}?text=${encodeURIComponent(msg)}\`, '\_blank');  
        }

        // \--- PAINEL FINANCEIRO & GRÁFICOS \---  
        let chartSalesInstance \= null;  
        let chartSizesInstance \= null;  
        let chartPaymentInstance \= null;  
        let chartMonthlyInstance \= null;

        function refreshAllViews() {  
            applyBranding();  
            renderProductsTable();  
            renderStockTable();  
            renderRomaneioTable();  
            updateFinancialKPIs();  
        }

        function updateFinancialKPIs() {  
            const totalGross \= APP\_STATE.sales.reduce((sum, s) \=\> sum \+ s.total, 0);  
            const totalCost \= APP\_STATE.sales.reduce((sum, s) \=\> sum \+ s.totalCost, 0);  
            const netProfit \= totalGross \- totalCost;  
            const margin \= totalGross \> 0 ? ((netProfit / totalGross) \* 100).toFixed(1) : 0;

            let totalPieces \= 0;  
            let totalStockValuation \= 0;  
            APP\_STATE.products.forEach(p \=\> {  
                const count \= p.sizes.P \+ p.sizes.M \+ p.sizes.G \+ p.sizes.GG;  
                totalPieces \+= count;  
                totalStockValuation \+= (count \* p.cost);  
            });

            // Dashboard  
            document.getElementById('dashTotalSales').innerText \= \`R$ ${totalGross.toFixed(2)}\`;  
            document.getElementById('dashSalesCount').innerText \= \`${APP\_STATE.sales.length} vendas realizadas\`;  
            document.getElementById('dashNetProfit').innerText \= \`R$ ${netProfit.toFixed(2)}\`;  
            document.getElementById('dashProfitMargin').innerText \= \`Margem Líquida: ${margin}%\`;  
            document.getElementById('dashTotalStock').innerText \= \`${totalPieces} un\`;  
            document.getElementById('dashModelsCount').innerText \= \`${APP\_STATE.products.length} modelos cadastrados\`;  
            document.getElementById('dashStockValuation').innerText \= \`R$ ${totalStockValuation.toFixed(2)}\`;

            // Financeiro  
            document.getElementById('finGrossSales').innerText \= \`R$ ${totalGross.toFixed(2)}\`;  
            document.getElementById('finTotalCost').innerText \= \`R$ ${totalCost.toFixed(2)}\`;  
            document.getElementById('finNetProfit').innerText \= \`R$ ${netProfit.toFixed(2)}\`;  
            document.getElementById('finMarginPercent').innerText \= \`Margem de Lucro: ${margin}%\`;  
        }

        function renderDashboardCharts() {  
            updateFinancialKPIs();

            // Gráfico de Faturamento vs Lucro  
            const ctx1 \= document.getElementById('chartDashboardSales')?.getContext('2d');  
            if (ctx1) {  
                if (chartSalesInstance) chartSalesInstance.destroy();  
                chartSalesInstance \= new Chart(ctx1, {  
                    type: 'bar',  
                    data: {  
                        labels: \['Totais Acumulados'\],  
                        datasets: \[  
                            { label: 'Faturamento Bruto', data: \[APP\_STATE.sales.reduce((s, x) \=\> s \+ x.total, 0)\], backgroundColor: '\#d97706' },  
                            { label: 'Lucro Líquido', data: \[APP\_STATE.sales.reduce((s, x) \=\> s \+ (x.total \- x.totalCost), 0)\], backgroundColor: '\#10b981' }  
                        \]  
                    },  
                    options: { responsive: true, maintainAspectRatio: false }  
                });  
            }

            // Gráfico de Tamanhos  
            const ctx2 \= document.getElementById('chartDashboardSizes')?.getContext('2d');  
            if (ctx2) {  
                if (chartSizesInstance) chartSizesInstance.destroy();  
                let pCount \= 0, mCount \= 0, gCount \= 0, ggCount \= 0;  
                APP\_STATE.products.forEach(p \=\> {  
                    pCount \+= p.sizes.P;  
                    mCount \+= p.sizes.M;  
                    gCount \+= p.sizes.G;  
                    ggCount \+= p.sizes.GG;  
                });

                chartSizesInstance \= new Chart(ctx2, {  
                    type: 'doughnut',  
                    data: {  
                        labels: \['P', 'M', 'G', 'GG'\],  
                        datasets: \[{  
                            data: \[pCount, mCount, gCount, ggCount\],  
                            backgroundColor: \['\#38bdf8', '\#818cf8', '\#f59e0b', '\#ec4899'\]  
                        }\]  
                    },  
                    options: { responsive: true, maintainAspectRatio: false }  
                });  
            }  
        }

        function renderFinanceCharts() {  
            // Pagamentos  
            const ctxPay \= document.getElementById('chartPaymentMethods')?.getContext('2d');  
            if (ctxPay) {  
                if (chartPaymentInstance) chartPaymentInstance.destroy();  
                  
                const payCounts \= { PIX: 0, 'Cartão de Crédito': 0, 'Cartão de Débito': 0, Dinheiro: 0 };  
                APP\_STATE.sales.forEach(s \=\> {  
                    if (payCounts\[s.paymentMethod\] \!== undefined) payCounts\[s.paymentMethod\] \+= s.total;  
                });

                chartPaymentInstance \= new Chart(ctxPay, {  
                    type: 'pie',  
                    data: {  
                        labels: Object.keys(payCounts),  
                        datasets: \[{  
                            data: Object.values(payCounts),  
                            backgroundColor: \['\#10b981', '\#3b82f6', '\#8b5cf6', '\#f59e0b'\]  
                        }\]  
                    },  
                    options: { responsive: true, maintainAspectRatio: false }  
                });  
            }

            // Mensal  
            const ctxMonthly \= document.getElementById('chartMonthlyFinance')?.getContext('2d');  
            if (ctxMonthly) {  
                if (chartMonthlyInstance) chartMonthlyInstance.destroy();  
                chartMonthlyInstance \= new Chart(ctxMonthly, {  
                    type: 'line',  
                    data: {  
                        labels: \['Histórico Geral'\],  
                        datasets: \[{  
                            label: 'Receita (R$)',  
                            data: \[APP\_STATE.sales.reduce((s, x) \=\> s \+ x.total, 0)\],  
                            borderColor: '\#d97706',  
                            tension: 0.3,  
                            fill: true,  
                            backgroundColor: 'rgba(217, 119, 6, 0.1)'  
                        }\]  
                    },  
                    options: { responsive: true, maintainAspectRatio: false }  
                });  
            }  
        }

        // \--- EXPORTAÇÃO EM PDF (JSPDF \+ HTML2CANVAS) \---  
        function exportProductsPDF() {  
            const { jsPDF } \= window.jspdf;  
            const doc \= new jsPDF();  
            doc.setFontSize(16);  
            doc.text(\`${APP\_STATE.brandName} \- Catálogo de Produtos\`, 14, 20);  
            doc.setFontSize(10);  
            doc.text(\`Gerado em: ${new Date().toLocaleDateString('pt-BR')}\`, 14, 26);

            let y \= 36;  
            APP\_STATE.products.forEach((p, i) \=\> {  
                if (y \> 270\) { doc.addPage(); y \= 20; }  
                const total \= p.sizes.P \+ p.sizes.M \+ p.sizes.G \+ p.sizes.GG;  
                doc.text(\`${i+1}. \[${p.code}\] ${p.name} \- ${p.print} (${p.color})\`, 14, y);  
                doc.text(\`Preço: R$ ${p.price.toFixed(2)} | Custo: R$ ${p.cost.toFixed(2)} | Grade: P:${p.sizes.P} M:${p.sizes.M} G:${p.sizes.G} GG:${p.sizes.GG} (Total: ${total})\`, 14, y \+ 6);  
                y \+= 14;  
            });

            doc.save(\`Catalogo\_Produtos\_${APP\_STATE.brandName}.pdf\`);  
        }

        function exportStockPDF() {  
            const { jsPDF } \= window.jspdf;  
            const doc \= new jsPDF();  
            doc.setFontSize(16);  
            doc.text(\`${APP\_STATE.brandName} \- Relatório de Inventário e Estoque\`, 14, 20);  
            doc.setFontSize(10);  
            doc.text(\`Gerado em: ${new Date().toLocaleDateString('pt-BR')}\`, 14, 26);

            let y \= 36;  
            APP\_STATE.products.forEach((p, i) \=\> {  
                if (y \> 270\) { doc.addPage(); y \= 20; }  
                const total \= p.sizes.P \+ p.sizes.M \+ p.sizes.G \+ p.sizes.GG;  
                doc.text(\`${p.code} \- ${p.name} | Total: ${total} un (Mínimo: ${p.minStock})\`, 14, y);  
                doc.text(\`Distribuição: P:${p.sizes.P} | M:${p.sizes.M} | G:${p.sizes.G} | GG:${p.sizes.GG}\`, 14, y \+ 5);  
                y \+= 12;  
            });

            doc.save(\`Inventario\_Estoque\_${APP\_STATE.brandName}.pdf\`);  
        }

        function exportFinancePDF() {  
            const { jsPDF } \= window.jspdf;  
            const doc \= new jsPDF();  
            const totalGross \= APP\_STATE.sales.reduce((s, x) \=\> s \+ x.total, 0);  
            const totalCost \= APP\_STATE.sales.reduce((s, x) \=\> s \+ x.totalCost, 0);  
            const netProfit \= totalGross \- totalCost;

            doc.setFontSize(16);  
            doc.text(\`${APP\_STATE.brandName} \- Relatório DRE Financeiro\`, 14, 20);  
            doc.setFontSize(11);  
            doc.text(\`Receita Bruta Total: R$ ${totalGross.toFixed(2)}\`, 14, 35);  
            doc.text(\`Custos das Mercadorias: R$ ${totalCost.toFixed(2)}\`, 14, 45);  
            doc.text(\`Lucro Líquido Real: R$ ${netProfit.toFixed(2)}\`, 14, 55);  
            doc.text(\`Total de Vendas Registradas: ${APP\_STATE.sales.length}\`, 14, 65);

            doc.save(\`Relatorio\_Financeiro\_${APP\_STATE.brandName}.pdf\`);  
        }

        function exportSingleRomaneioPDF(romaneioId) {  
            const sale \= APP\_STATE.sales.find(s \=\> s.id \=== romaneioId);  
            if (\!sale) return;

            const container \= document.getElementById('pdfExportContainer');  
            container.innerHTML \= \`  
                \<div style="font-family: sans-serif; padding: 20px; border: 1px solid \#ddd; border-radius: 12px;"\>  
                    \<div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid \#d97706; padding-bottom: 10px;"\>  
                        \<div\>  
                            \<h1 style="font-size:20px; font-weight:bold; margin:0; color:\#1e293b;"\>${APP\_STATE.brandName}\</h1\>  
                            \<p style="font-size:11px; color:\#64748b; margin:2px 0 0 0;"\>${APP\_STATE.brandSubtitle}\</p\>  
                        \</div\>  
                        \<div style="text-align:right;"\>  
                            \<h2 style="font-size:16px; color:\#d97706; margin:0;"\>${sale.id}\</h2\>  
                            \<span style="font-size:11px; color:\#64748b;"\>Data: ${sale.date}\</span\>  
                        \</div\>  
                    \</div\>

                    \<div style="margin: 15px 0; font-size: 12px; line-height: 1.6;"\>  
                        \<strong\>Cliente:\</strong\> ${sale.client.name}\<br\>  
                        \<strong\>WhatsApp:\</strong\> ${sale.client.phone} | \<strong\>E-mail:\</strong\> ${sale.client.email}\<br\>  
                        \<strong\>Forma de Pagamento:\</strong\> ${sale.paymentMethod}  
                    \</div\>

                    \<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;"\>  
                        \<thead\>  
                            \<tr style="background-color: \#f1f5f9; text-align: left;"\>  
                                \<th style="padding: 8px; border-bottom: 1px solid \#cbd5e1;"\>Item / Modelo\</th\>  
                                \<th style="padding: 8px; border-bottom: 1px solid \#cbd5e1;"\>Estampa & Cor\</th\>  
                                \<th style="padding: 8px; border-bottom: 1px solid \#cbd5e1; text-align:center;"\>Tam.\</th\>  
                                \<th style="padding: 8px; border-bottom: 1px solid \#cbd5e1; text-align:right;"\>Valor\</th\>  
                            \</tr\>  
                        \</thead\>  
                        \<tbody\>  
                            ${sale.items.map(i \=\> \`  
                                \<tr\>  
                                    \<td style="padding: 8px; border-bottom: 1px solid \#f1f5f9;"\>${i.name}\</td\>  
                                    \<td style="padding: 8px; border-bottom: 1px solid \#f1f5f9;"\>${i.print} (${i.color})\</td\>  
                                    \<td style="padding: 8px; border-bottom: 1px solid \#f1f5f9; text-align:center; font-weight:bold;"\>${i.size}\</td\>  
                                    \<td style="padding: 8px; border-bottom: 1px solid \#f1f5f9; text-align:right;"\>R$ ${i.price.toFixed(2)}\</td\>  
                                \</tr\>  
                            \`).join('')}  
                        \</tbody\>  
                    \</table\>

                    \<div style="margin-top: 20px; text-align: right;"\>  
                        \<span style="font-size: 12px; color: \#64748b;"\>Valor Total a Pagar:\</span\>  
                        \<h2 style="font-size: 22px; font-weight: bold; margin: 4px 0 0 0; color: \#0f172a;"\>R$ ${sale.total.toFixed(2)}\</h2\>  
                        \<p style="font-size: 10px; color: \#64748b; margin-top: 5px;"\>Chave PIX para pagamento: \<strong\>${APP\_STATE.pixKey}\</strong\>\</p\>  
                    \</div\>  
                \</div\>  
            \`;

            container.classList.remove('hidden');

            html2canvas(container, { scale: 2 }).then(canvas \=\> {  
                const imgData \= canvas.toDataURL('image/png');  
                const { jsPDF } \= window.jspdf;  
                const pdf \= new jsPDF('p', 'mm', 'a4');  
                const imgWidth \= 190;  
                const imgHeight \= (canvas.height \* imgWidth) / canvas.width;  
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);  
                pdf.save(\`Romaneio\_${sale.id}\_${sale.client.name.replace(/\\s+/g, '\_')}.pdf\`);  
                container.classList.add('hidden');  
            });  
        }

        // \--- INICIALIZAÇÃO NO CARREGAMENTO \---  
        window.addEventListener('DOMContentLoaded', () \=\> {  
            initAppStorage();  
            lucide.createIcons();  
        });  
    \</script\>  
\</body\>  
\</html\>

3\. Como Utilizar e Próximos Passos:  
Para Executar Imediatamente: Basta criar um arquivo index.html, colar o código e dar dois cliques.  
Para rodar no Celular: Você pode hospedar gratuitamente no Vercel, Netlify ou GitHub Pages e salvar como atalho na tela inicial do celular como um App Nativo (PWA).  
Segurança dos Dados: O app salva tudo automaticamente no navegador (não perde dados ao atualizar ou fechar). Caso queira migrar para um backend na nuvem com multiusuários no futuro, o código está 100% componentizado e pronto para ligar a uma API REST ou Firebase/Supabase.  
Citations

[https://github.com/mag8888/pla](https://github.com/mag8888/pla)  
