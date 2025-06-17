// Espera o conteúdo da página carregar completamente para rodar o script
document.addEventListener('DOMContentLoaded', function () {

    // 1. SELECIONAR OS ELEMENTOS DO HTML
    const form = document.getElementById('venda-form');
    const resultadoDiv = document.getElementById('resultado');

    // 2. ADICIONAR UM "OUVINTE" PARA O EVENTO DE SUBMISSÃO DO FORMULÁRIO
    form.addEventListener('submit', function (event) {
        // Previne o comportamento padrão do formulário (que é recarregar a página)
        event.preventDefault();

        // 3. CAPTURAR OS VALORES DOS INPUTS
        const custoTotal = parseFloat(document.getElementById('preco-custo').value);
        const precoVendaUnitario = parseFloat(document.getElementById('preco-venda').value);
        const quantidade = parseInt(document.getElementById('quantidade').value);
        const tarifaPercentual = parseFloat(document.getElementById('tarifa-ml').value);
        const custoFrete = parseFloat(document.getElementById('frete').value);

        // 4. REALIZAR OS CÁLCULOS
        const receitaBruta = precoVendaUnitario * quantidade;
        const custoProdutosVendidos = custoTotal; // O custo total dos itens informados
        
        const valorTarifa = receitaBruta * (tarifaPercentual / 100);
        
        const lucroBruto = receitaBruta - custoProdutosVendidos;
        const lucroLiquido = lucroBruto - valorTarifa - custoFrete;
        
        // Formata os valores para ficarem como moeda (R$ XX,XX)
        const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // 5. EXIBIR O RESULTADO NA TELA
        resultadoDiv.innerHTML = `
            <h3>Resumo da Venda</h3>
            <p><strong>Receita Bruta:</strong> ${formatarMoeda(receitaBruta)}</p>
            <p><strong>Custo dos Produtos:</strong> ${formatarMoeda(custoProdutosVendidos)}</p>
            <p><strong>Lucro Bruto:</strong> ${formatarMoeda(lucroBruto)}</p>
            <p>-----------------------------------</p>
            <p><strong>Despesas:</strong></p>
            <ul>
                <li>Tarifa ML (${tarifaPercentual}%): ${formatarMoeda(valorTarifa)}</li>
                <li>Frete: ${formatarMoeda(custoFrete)}</li>
            </ul>
            <p><strong>LUCRO LÍQUIDO DA VENDA: ${formatarMoeda(lucroLiquido)}</strong></p>
        `;
    });
});