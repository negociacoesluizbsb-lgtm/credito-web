document.getElementById("carregarRelatorio").addEventListener("click", async () => {
    const container = document.getElementById("relatorioContainer");
    container.innerHTML = "Carregando...";

    try {
        const response = await fetch("https://api-smart-production-5d59.up.railway.app/relatorio/credito-html");
        if (!response.ok) throw new Error(`Erro ${response.status}: Não foi possível carregar o relatório`);

        const data = await response.json();
        container.innerHTML = "";

        // -------------------- CARD 1: Análise da Empresa --------------------
        const empresaCard = document.createElement("div");
        empresaCard.classList.add("card");

        // Cor do rating
        const ratingMap = { A:'#2ecc71', B:'#27ae60', C:'#f1c40f', D:'#e67e22', E:'#e74c3c' };
        const ratingColor = ratingMap[data.rating.nota.toUpperCase()] || '#95a5a6';

        empresaCard.innerHTML = `
            <h2 class="section-title">Análise da Empresa</h2>
            <p><strong>Empresa:</strong> ${data.empresa}</p>
            <p><strong>Setor:</strong> ${data.setor}</p>
            <p><strong>Capacidade de Endividamento:</strong></p>
            <div class="progress-bar">
                <div class="progress" id="capacidadeBar" style="width:0%;"></div>
            </div>
            <p><strong>Rating:</strong> <span style="color:${ratingColor}; font-weight:bold;">${data.rating.nota}</span> - ${data.rating.justificativa}</p>
            <p><strong>Perfil de Crédito:</strong> ${data.perfil_credito.classificacao} - ${data.perfil_credito.justificativa}</p>

            <div class="charts">
                <canvas id="perfilChart"></canvas>
                <canvas id="capacidadeChart"></canvas>
                <canvas id="evolucaoChart"></canvas>
            </div>
        `;
        container.appendChild(empresaCard);

        // -------------------- Barra de progresso animada --------------------
        const capacidadePercent = Math.min((data.capacidade_endividamento / 1000000) * 100, 100);
        const capacidadeBar = document.getElementById("capacidadeBar");
        let width = 0;
        const interval = setInterval(() => {
            if(width >= capacidadePercent) clearInterval(interval);
            else {
                width++;
                capacidadeBar.style.width = width + "%";
                capacidadeBar.textContent = `${Math.round(width)}%`;
            }
        }, 15);

        // -------------------- Gráfico Doughnut Perfil de Crédito --------------------
        new Chart(document.getElementById("perfilChart"), {
            type: 'doughnut',
            data: {
                labels: ['Positivo','Neutro','Negativo'],
                datasets: [{
                    data:[
                        data.perfil_credito.classificacao==='Positivo'?1:0,
                        data.perfil_credito.classificacao==='Neutro'?1:0,
                        data.perfil_credito.classificacao==='Negativo'?1:0
                    ],
                    backgroundColor: ['#2ecc71','#f1c40f','#e74c3c'],
                    borderWidth: 0
                }]
            },
            options:{plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:10}}},cutout:'70%'}
        });

        // -------------------- Gráfico Barra Capacidade vs Limite --------------------
        new Chart(document.getElementById("capacidadeChart"), {
            type:'bar',
            data:{
                labels:['Capacidade Atual','Limite Máximo'],
                datasets:[{label:'R$',data:[data.capacidade_endividamento,1000000],backgroundColor:['#2980b9','#bdc3c7'] }]
            },
            options:{
                plugins:{legend:{display:false}},
                scales:{y:{beginAtZero:true,ticks:{callback:value=>'R$ '+value.toLocaleString()}}}
            }
        });

        // -------------------- Gráfico Linha Evolução de Rating (Exemplo) --------------------
        const ratingHistory = [3,4,4,3,4]; // exemplo fictício (1-5)
        new Chart(document.getElementById("evolucaoChart"), {
            type:'line',
            data:{
                labels:['Jan','Feb','Mar','Apr','May'],
                datasets:[{
                    label:'Evolução do Rating',
                    data: ratingHistory,
                    borderColor:'#8e44ad',
                    backgroundColor:'rgba(142,68,173,0.2)',
                    tension:0.3,
                    fill:true
                }]
            },
            options:{
                responsive:true,
                plugins:{legend:{display:false}},
                scales:{y:{beginAtZero:true,max:5}}
            }
        });

        // -------------------- CARD 2: Parecer de Crédito --------------------
        const creditoCard = document.createElement("div");
        creditoCard.classList.add("card");

        creditoCard.innerHTML = `
            <h2 class="section-title">Parecer de Crédito</h2>
            <p><strong>Conclusão:</strong> ${data.parecer.conclusao}</p>
            <p><strong>Observações:</strong> ${data.parecer.observacoes}</p>

            <h3>Proposta de Crédito</h3>
            <table>
                <tr><th>Valor</th><td>R$ ${data.proposta.valor.toLocaleString()}</td></tr>
                <tr><th>Prazo</th><td>${data.proposta.prazo_meses} meses</td></tr>
                <tr><th>Juros</th><td>${data.proposta.taxa_juros}% a.m.</td></tr>
                <tr><th>Garantias</th><td>${data.proposta.garantias}</td></tr>
            </table>

            <h3>Decisão Final</h3>
            <p><strong>Status:</strong> ${data.decisao.status}</p>
            <p><strong>Condições:</strong> ${data.decisao.condicoes}</p>
        `;
        container.appendChild(creditoCard);

    } catch (err) {
        container.innerHTML = `<p style="color:red;">Não foi possível carregar o relatório.<br>Detalhes: ${err.message}</p>`;
        console.error("Erro ao carregar relatório:", err);
    }
});
