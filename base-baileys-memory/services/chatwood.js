const sendMessageChatWood = async (msg = "", message_type = "") => {
  var myHeaders = new Headers();
  myHeaders.append("api_access_token", "LT2SMj6dK3HEtJceNTcQ8QNJ");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    content: msg,
    message_type: message_type,
    private: true,
    content_attributes: {},
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

/*   const agentes = {
    agente1 : true,
    agente2 : true,
    agente3 : true
  } */

 /*  switch (agentes){
    case agentes.agente1 == true:  */
        const dataRaw = await fetch(`https://chatwoot-production-d21a.up.railway.app/api/v1/accounts/1/conversations/6/messages`, requestOptions);
        const data = await dataRaw.json();
       /*  agentes.agente1 = false */
        return data;
   /*  case agentes.agente2 == true: 
        const dataRaw2 = await fetch(`https://chatwoot-production-d21a.up.railway.app/api/v1/accounts/1/conversations/5/messages`, requestOptions);
        const data2 = await dataRaw.json();
        agentes.agente2 = false
        return data2;
    default :
        return console.log("ok"); */

  }
  




module.exports = { sendMessageChatWood };
