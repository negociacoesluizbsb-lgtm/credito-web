document.getElementById("carregarRelatorio").addEventListener("click", async () => {
    const container = document.getElementById("relatorioContainer");
    container.innerHTML = "Carregando...";

    try {
        const response = await fetch("https://SEU-PROJETO.up.railway.app/relatorio/credito-html");
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `Erro ao carregar relatório: ${err}`;
    }
});

