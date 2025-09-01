import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBiVmXvleoCZmmWh9esguoQAKBCf2idm40",
  authDomain: "agente-de-gestao-de-acesso.firebaseapp.com",
  projectId: "agente-de-gestao-de-acesso",
  // use o MESMO bucket onde você aplicou CORS (pelo seu print: .firebasestorage.app)
  storageBucket: "agente-de-gestao-de-acesso.firebasestorage.app",
  messagingSenderId: "1030758235617",
  appId: "1:1030758235617:web:319f52de0466dc9a8866a0",
  measurementId: "G-JLJEQ2WZSH",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// aponta explicitamente para o bucket .firebasestorage.app
export const storage = getStorage(
  app,
  "gs://agente-de-gestao-de-acesso.firebasestorage.app",
);

// (opcional) exporta apenas para referência
export const storageBucket = "agente-de-gestao-de-acesso.firebasestorage.app";

/*
IMPORTANTE: Para que as imagens dos dependentes carreguem corretamente, 
verifique se as regras de segurança do Firebase Storage estão configuradas corretamente.

Exemplo de regras permissivas para desenvolvimento:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Permite leitura pública
      allow write: if request.auth != null;  // Requer autenticação para escrita
    }
  }
}

Para produção, considere regras mais restritivas baseadas em autenticação.
*/