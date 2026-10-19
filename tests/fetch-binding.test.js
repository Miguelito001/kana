const assert=require('node:assert/strict');
const p=require('../dist/persistence-core.js');

(async()=>{
  const originalFetch=globalThis.fetch;
  let receiver=null;
  globalThis.fetch=function(){
    receiver=this;
    return Promise.resolve({ok:true,json:async()=>({acceptedIds:[]})});
  };
  try{
    const remote=new p.SupabaseRemoteRepository({url:'https://example.invalid',anonKey:'public',accessToken:'session'});
    await remote.pushBatch([]);
    assert.equal(receiver,globalThis,'fetch nativo deve ser invocado com o contexto global do navegador');
  }finally{
    globalThis.fetch=originalFetch;
  }
  console.log('FETCH BINDING: chamada automática preserva o contexto global');
})().catch(error=>{console.error(error);process.exitCode=1;});
