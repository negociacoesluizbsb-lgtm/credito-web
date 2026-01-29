document.getElementById("carregarRelatorio").addEventListener("click", async () => {
    const container = document.getElementById("relatorioContainer");
    container.innerHTML = "Carregando...";

    try {
        const response = await fetch("https://api-smart-production-5d59.up.railway.app/relatorio/credito-html");

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: Não foi possível carregar o relatório`);
        }

        const data = await response.json();
        container.innerHTML = "";

        // -------------------- CARD 1: Análise da Empresa --------------------
        const empresaCard = document.createElement("div");
        empresaCard.classList.add("card");

        // Determina cor do rating
        let ratingColor;
        switch(data.rating.nota.toUpperCase()) {
            case 'A': ratingColor = '#2ecc71'; break; // verde
            case 'B': ratingColor = '#27ae60'; break; // verde médio
            case 'C': ratingColor = '#f1c40f'; break; // amarelo
            case 'D': ratingColor = '#e67e22'; break; // laranja
            case 'E': ratingColor = '#e74c3c'; break; // vermelho
            default: ratingColor = '#95a5a6'; // cinza
        }

        empresaCard.innerHTML = `
            <h2 class="section-title">Análise da Empresa</h2>
            <p><strong>Empresa:</strong> ${data.empresa}</p>
            <p><strong>Setor:</strong> ${data.setor}</p>
            <p><strong>Capacidade de Endividamento:</strong></p>
            <div class="progress-bar">
                <div class="progress" id="capacidadeBar" style="width:0%; background-color:#2980b9;">0%</div>
            </div>
            <p><strong>Rating:</strong> <span style="color:${ratingColor}; font-weight:bold;">${data.rating.nota}</span> - ${data.rating.justificativa}</p>
            <p><strong>Perfil de Crédito:</strong> ${data.perfil_credito.classificacao} - ${data.perfil_credito.justificativa}</p>
            <div>
                <canvas id="perfilChart"></canvas>
            </div>
        `;
        container.appendChild(empresaCard);

        // -------------------- Animação da barra de capacidade --------------------
        const capacidadePercent = Math.min((data.capacidade_endividamento / 1000000) * 100, 100); // Ajuste conforme limite desejado
        const capacidadeBar = document.getElementById("capacidadeBar");
        let width = 0;
        const interval = setInterval(() => {
            if(width >= capacidadePercent){
                clearInterval(interval);
            } else {
                width += 1;
                capacidadeBar.style.width = width + "%";
                capacidadeBar.textContent = `${Math.round(width)}%`;
            }
        }, 15);

        // -------------------- Gráfico do Perfil --------------------
        const ctx = document.getElementById("perfilChart").getContext("2d");
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positivo', 'Neutro', 'Negativo'],
                datasets: [{
                    data: [
                        data.perfil_credito.classificacao === 'Positivo' ? 1 : 0,
                        data.perfil_credito.classificacao === 'Neutro' ? 1 : 0,
                        data.perfil_credito.classificacao === 'Negativo' ? 1 : 0
                    ],
                    backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                },
                cutout: '70%'
            }
        });

        // -------------------- CARD 2: Parecer do Crédito --------------------
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
        container.innerHTML = `
            <p style="color:red;">
                Não foi possível carregar o relatório.<br>
                Verifique sua conexão ou se a API está online.<br>
                Detalhes: ${err.message}
            </p>
        `;
        console.error("Erro ao carregar relatório:", err);
    }
});
