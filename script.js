document.getElementById("carregarRelatorio").addEventListener("click", async () => {
    const container = document.getElementById("relatorioContainer");
    container.innerHTML = "Carregando...";

    try {
        // Endpoint correto da API
        const response = await fetch("https://api-smart-production-5d59.up.railway.app/relatorio/credito-html");

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: Não foi possível carregar o relatório`);
        }

        const html = await response.text();
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `
            <p style="color:red;">
                Não foi possível carregar o relatório. <br>
                Verifique sua conexão ou se a API está online.<br>
                Detalhes: ${err.message}
            </p>
        `;
        console.error("Erro ao carregar relatório:", err);
    }
});
