document.getElementById("carregarRelatorio").addEventListener("click", async () => {
    const container = document.getElementById("relatorioContainer");
    container.innerHTML = "Carregando...";

    try {
        const response = await fetch("https://api-smart-production-5d59.up.railway.app/relatorio/credito-html");
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `Erro ao carregar relatório: ${err}`;
    }
});
