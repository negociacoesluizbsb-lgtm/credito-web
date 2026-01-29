document.getElementById("carregarRelatorio").addEventListener("click", async () => {
    const container = document.getElementById("relatorioContainer");
    container.innerHTML = "Carregando...";

    try {
        // Substitua pela sua URL live do Railway
        const response = await fetch("https://api-smart-production-5d59.up.railway.app/relatorio/credito-html");

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: Não foi possível carregar o relatório`);
        }

        const data = await response.json(); // Recebemos JSON da API
        container.innerHTML = ""; // Limpa container antes de renderizar

        // -------------------- CARD 1: Análise da Empresa --------------------
        const empresaCard = document.createElement("div");
        empresaCard.classList.add("card");

        empresaCard.innerHTML = `
            <h2 class="section-title">Análise da Empresa</h2>
            <p><strong>Empresa:</strong> ${data.empresa}</p>
            <p><strong>Setor:</strong> ${data.setor}</p>
            <p><strong>Capacidade de Endividamento:</strong> R$ ${data.capacidade_endividamento.toLocaleString()}</p>
            
            <p><strong>Rating:</strong> ${data.rating.nota} - ${data.rating.justificativa}</p>
            <p><strong>Perfil de Crédito:</strong> ${data.perfil_credito.classificacao} - ${data.perfil_credito.justificativa}</p>

            <div>
                <canvas id="perfilChart"></canvas>
            </div>
        `;
        container.appendChild(empresaCard);

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
