<?php
// Define que a resposta será em formato JSON
header('Content-Type: application/json');

// --- 1. CONFIGURAÇÃO DO BANCO DE DADOS ---
$servername = "localhost";
$username = "root"; // Padrão do XAMPP
$password = "";     // Padrão do XAMPP
$dbname = "dashboard_ml_db";

// --- 2. CONEXÃO COM O BANCO DE DADOS ---
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão falhou
if ($conn->connect_error) {
    // Envia uma resposta de erro e encerra o script
    echo json_encode(['success' => false, 'message' => 'Erro de Conexão: ' . $conn->connect_error]);
    exit();
}

// --- 3. RECEBENDO OS DADOS DO FRONT-END ---
// O JavaScript vai enviar os dados em formato JSON, então precisamos decodificá-los
$input = json_decode(file_get_contents('php://input'), true);

// Atribui os dados a variáveis
$sku = $input['sku'] ?? '';
$custoTotal = (float)($input['custoTotal'] ?? 0);
$precoVenda = (float)($input['precoVenda'] ?? 0);
$quantidade = (int)($input['quantidade'] ?? 0);
$tarifaPercentual = (float)($input['tarifaPercentual'] ?? 0);
$custoFrete = (float)($input['custoFrete'] ?? 0);

// Validação simples
if (empty($sku) || $quantidade <= 0) {
    echo json_encode(['success' => false, 'message' => 'SKU ou quantidade inválida.']);
    exit();
}

// --- 4. CÁLCULOS DO BACK-END ---
$receitaBruta = $precoVenda * $quantidade;
$valorTarifa = $receitaBruta * ($tarifaPercentual / 100);
$lucroBruto = $receitaBruta - $custoTotal;
$lucroLiquido = $lucroBruto - $valorTarifa - $custoFrete;

// --- 5. OPERAÇÕES NO BANCO DE DADOS (TRANSAÇÃO) ---
// Uma transação garante que ou TUDO funciona, ou NADA é salvo.
// Isso evita que você registre uma venda mas não dê baixa no estoque, por exemplo.
$conn->begin_transaction();

try {
    // a) Insere o registro na tabela de vendas
    $sql_venda = "INSERT INTO vendas (sku_produto, preco_venda_anuncio, quantidade, tarifa_percentual, custo_frete, lucro_liquido_venda) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_venda = $conn->prepare($sql_venda);
    // 'sdiidd' -> s=string, d=double/decimal, i=integer
    $stmt_venda->bind_param("sdiidd", $sku, $precoVenda, $quantidade, $tarifaPercentual, $custoFrete, $lucroLiquido);
    $stmt_venda->execute();

    // b) Atualiza (dá baixa) no estoque da tabela de produtos
    $sql_estoque = "UPDATE produtos SET estoque_atual = estoque_atual - ? WHERE sku = ?";
    $stmt_estoque = $conn->prepare($sql_estoque);
    $stmt_estoque->bind_param("is", $quantidade, $sku);
    $stmt_estoque->execute();
    
    // Se chegou até aqui sem erros, confirma a transação
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Venda registrada e estoque atualizado com sucesso!']);

} catch (mysqli_sql_exception $exception) {
    // Se deu algum erro, desfaz tudo que foi feito na transação
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar no banco de dados: ' . $exception->getMessage()]);
}

// Fecha os statements e a conexão
$stmt_venda->close();
$stmt_estoque->close();
$conn->close();
?>