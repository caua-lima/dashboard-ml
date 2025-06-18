// Espera o conteúdo da página carregar completamente para rodar o script
document.addEventListener('DOMContentLoaded', function () {

    // 1. SELECIONAR OS ELEMENTOS DO HTML
    const form = document.getElementById('venda-form');
    const resultadoDiv = document.getElementById('resultado');
    const submitButton = form.querySelector('button[type="submit"]');

    // 2. ADICIONAR UM "OUVINTE" PARA O EVENTO DE SUBMISSÃO DO FORMULÁRIO
    form.addEventListener('submit', function (event) {
        // Previne o comportamento padrão do formulário (que é recarregar a página)
        event.preventDefault();

        // --- CAPTURAR OS VALORES DOS INPUTS ---
        const sku = document.getElementById('sku').value;
        const custoTotal = parseFloat(document.getElementById('preco-custo').value);
        const precoVenda = parseFloat(document.getElementById('preco-venda').value);
        const quantidade = parseInt(document.getElementById('quantidade').value);
        const tarifaPercentual = parseFloat(document.getElementById('tarifa-ml').value);
        const custoFrete = parseFloat(document.getElementById('frete').value);

        // --- PASSO NOVO: PREPARAR DADOS PARA ENVIO ---
        // Criamos um objeto JavaScript com todos os dados que o PHP espera receber.
        const dadosVenda = {
            sku: sku,
            custoTotal: custoTotal,
            precoVenda: precoVenda,
            quantidade: quantidade,
            tarifaPercentual: tarifaPercentual,
            custoFrete: custoFrete
        };

        // Bloqueia o botão e mostra um feedback para o usuário
        submitButton.disabled = true;
        resultadoDiv.innerHTML = '<p>Salvando no banco de dados...</p>';
        resultadoDiv.style.color = 'blue';

        // --- PASSO NOVO: ENVIAR DADOS PARA O BACKEND (PHP) USANDO FETCH ---
        // A função fetch é a maneira moderna de fazer requisições a um servidor.
        fetch('php/salvar_venda.php', { // O caminho para o seu arquivo PHP
            method: 'POST', // Estamos enviando dados, então usamos POST
            headers: {
                'Content-Type': 'application/json' // Avisa ao PHP que estamos enviando JSON
            },
            body: JSON.stringify(dadosVenda) // Converte nosso objeto JS em uma string JSON
        })
        .then(response => response.json()) // Pega a resposta do PHP e a converte de JSON para um objeto JS
        .then(data => {
            // "data" é o objeto JS que o PHP enviou de volta (com 'success' e 'message')
            if (data.success) {
                // Se o PHP disse que deu tudo certo
                resultadoDiv.style.color = 'green';
                resultadoDiv.innerHTML = `<strong>${data.message}</strong>`;
                form.reset(); // Limpa o formulário após o sucesso
            } else {
                // Se o PHP disse que deu algum erro
                resultadoDiv.style.color = 'red';
                resultadoDiv.innerHTML = `<strong>Erro:</strong> ${data.message}`;
            }
        })
        .catch(error => {
            // Este bloco é executado se houver um erro de rede (ex: PHP não encontrado, servidor fora do ar)
            resultadoDiv.style.color = 'red';
            resultadoDiv.innerHTML = `<strong>Erro de Conexão:</strong> Não foi possível contatar o servidor. Detalhes: ${error}`;
        })
        .finally(() => {
            // Este bloco é executado SEMPRE no final, dando certo ou errado
            submitButton.disabled = false; // Reabilita o botão
        });
    });
});