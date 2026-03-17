const fs = require('fs');

console.log('Iniciando processamento...');

try {
  const conteudo = fs.readFileSync('LISTA_COMPLETA_COM_ACOMPANHANTES copy.txt', 'utf8');
  const linhas = conteudo.split('\n');
  
  console.log(`Total de linhas: ${linhas.length}`);
  
  let novasLinhas = [];
  let pessoasProcessadas = 0;
  
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Se é o início de uma pessoa (NÚMERO:)
    if (linha.startsWith('NÚMERO:')) {
      let pessoa = {};
      let j = i;
      
      // Processar até encontrar o separador ---
      while (j < linhas.length && !linhas[j].startsWith('---')) {
        const linhaPessoa = linhas[j];
        if (linhaPessoa.includes(':')) {
          const [chave, ...valorParts] = linhaPessoa.split(':');
          const valor = valorParts.join(':').trim();
          pessoa[chave.trim()] = valor;
        }
        j++;
      }
      
      // Se tem campos de presença, processar
      if (pessoa['PRESENÇA QUINTA'] || pessoa['PRESENÇA SEXTA'] || pessoa['PRESENÇA SÁBADO'] || pessoa['PRESENÇA DOMINGO']) {
        // Determinar os dias
        let dias = [];
        if (pessoa['PRESENÇA QUINTA'] === 'PRESENTE' || pessoa['PRESENÇA QUINTA'] === 'AUSENTE') {
          dias.push('25');
        }
        if (pessoa['PRESENÇA SEXTA'] === 'PRESENTE' || pessoa['PRESENÇA SEXTA'] === 'AUSENTE') {
          dias.push('26');
        }
        if (pessoa['PRESENÇA SÁBADO'] === 'PRESENTE' || pessoa['PRESENÇA SÁBADO'] === 'AUSENTE') {
          dias.push('27');
        }
        if (pessoa['PRESENÇA DOMINGO'] === 'PRESENTE' || pessoa['PRESENÇA DOMINGO'] === 'AUSENTE') {
          dias.push('28');
        }
        
        // Adicionar campo DIAS
        pessoa['DIAS'] = dias.join(',');
        
        // Remover campos de presença
        delete pessoa['PRESENÇA QUINTA'];
        delete pessoa['PRESENÇA SEXTA'];
        delete pessoa['PRESENÇA SÁBADO'];
        delete pessoa['PRESENÇA DOMINGO'];
        
        pessoasProcessadas++;
      }
      
      // Reconstruir as linhas da pessoa
      const campos = ['NÚMERO', 'NOME', 'CONTATO', 'CPF', 'ACOMPANHANTE', 'CPF ACOMPANHANTE', 'DIAS', 'CARGO', 'STATUS', 'CONVITE', 'CATEGORIA'];
      for (const campo of campos) {
        if (pessoa[campo] !== undefined) {
          novasLinhas.push(`${campo}: ${pessoa[campo]}`);
        }
      }
      novasLinhas.push('---');
      novasLinhas.push(''); // linha em branco
      
      i = j; // Pular para o próximo
    } else {
      novasLinhas.push(linha);
    }
  }
  
  // Salvar arquivo
  fs.writeFileSync('LISTA_COMPLETA_COM_ACOMPANHANTES copy.txt', novasLinhas.join('\n'));
  
  console.log(`✅ Processamento concluído!`);
  console.log(`📊 Pessoas processadas: ${pessoasProcessadas}`);
  
} catch (error) {
  console.error('Erro:', error.message);
}
