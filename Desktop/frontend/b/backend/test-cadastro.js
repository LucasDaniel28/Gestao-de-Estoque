const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuração do teste
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_IMAGE_PATH = path.join(__dirname, 'uploads', 'test-face.jpg');

async function testCadastroCompleto() {
  console.log('🚀 Iniciando teste de cadastro completo com facial...\n');

  try {
    // 1. Verificar status do dispositivo
    console.log('1️⃣ Verificando status do dispositivo...');
    const statusResponse = await axios.get(`${API_BASE_URL}/patients/device-status`);
    console.log('✅ Status do dispositivo:', statusResponse.data);
    
    if (!statusResponse.data.online) {
      console.log('❌ Dispositivo não está online. Teste interrompido.');
      return;
    }

    // 2. Criar biblioteca facial
    console.log('\n2️⃣ Criando biblioteca facial...');
    try {
      const libResponse = await axios.post(`${API_BASE_URL}/patients/face-library`);
      console.log('✅ Biblioteca facial criada:', libResponse.data);
    } catch (error) {
      console.log('⚠️ Erro ao criar biblioteca facial (pode já existir):', error.response?.data || error.message);
    }

    // 3. Preparar dados do paciente
    console.log('\n3️⃣ Preparando dados do paciente...');
    const patientData = {
      employeeNo: 'TEST001',
      name: 'João Silva Teste',
      gender: 'M',
      dateOfBirth: '1990-01-01'
    };

    // 4. Verificar se existe imagem de teste
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.log('❌ Imagem de teste não encontrada. Criando imagem dummy...');
      // Criar uma imagem dummy para teste
      const dummyImage = Buffer.from('fake-image-data');
      fs.writeFileSync(TEST_IMAGE_PATH, dummyImage);
    }

    // 5. Cadastrar paciente com foto
    console.log('\n4️⃣ Cadastrando paciente com foto facial...');
    const formData = new FormData();
    formData.append('employeeNo', patientData.employeeNo);
    formData.append('name', patientData.name);
    formData.append('gender', patientData.gender);
    formData.append('dateOfBirth', patientData.dateOfBirth);
    formData.append('photo', fs.createReadStream(TEST_IMAGE_PATH));

    const cadastroResponse = await axios.post(`${API_BASE_URL}/patients`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });

    console.log('✅ Cadastro realizado:', cadastroResponse.data);

    // 6. Verificar se o usuário foi criado
    console.log('\n5️⃣ Verificando se o usuário foi criado...');
    const usersResponse = await axios.get(`${API_BASE_URL}/patients`);
    const user = usersResponse.data.data?.find(u => u.employeeNo === patientData.employeeNo);
    
    if (user) {
      console.log('✅ Usuário encontrado na lista:', user);
    } else {
      console.log('⚠️ Usuário não encontrado na lista');
    }

    console.log('\n🎉 Teste de cadastro completo finalizado com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.response?.data || error.message);
    
    if (error.response?.status === 207) {
      console.log('⚠️ Cadastro parcial - usuário criado mas foto falhou');
    }
  }
}

async function testEndpointsIndividuais() {
  console.log('\n🔧 Testando endpoints individuais...\n');

  try {
    // Teste 1: Status do dispositivo
    console.log('📡 Testando status do dispositivo...');
    const status = await axios.get(`${API_BASE_URL}/patients/device-status`);
    console.log('✅ Status:', status.data);

    // Teste 2: Criar biblioteca facial
    console.log('\n📚 Testando criação de biblioteca facial...');
    try {
      const lib = await axios.post(`${API_BASE_URL}/patients/face-library`);
      console.log('✅ Biblioteca:', lib.data);
    } catch (error) {
      console.log('⚠️ Biblioteca:', error.response?.data || error.message);
    }

    // Teste 3: Listar usuários
    console.log('\n👥 Testando listagem de usuários...');
    const users = await axios.get(`${API_BASE_URL}/patients`);
    console.log('✅ Usuários:', users.data.data?.length || 0, 'encontrados');

  } catch (error) {
    console.error('❌ Erro nos testes individuais:', error.response?.data || error.message);
  }
}

// Executar testes
async function runTests() {
  console.log('🧪 INICIANDO TESTES DE CADASTRO FACIAL\n');
  console.log('=' .repeat(50));
  
  await testEndpointsIndividuais();
  console.log('\n' + '=' .repeat(50));
  await testCadastroCompleto();
  
  console.log('\n🏁 TESTES FINALIZADOS');
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCadastroCompleto, testEndpointsIndividuais }; 