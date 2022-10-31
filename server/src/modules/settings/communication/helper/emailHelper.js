const getEmailContent = (templateDetails) => {
    let { name, content, contentType, senderIds, activeProviders = [] } = templateDetails;
    let emailContent = `
    <html>
    <body>
    <div 
    style = "
    background: #FFC5B4 0% 0% no-repeat padding-box; 
    opacity: 0.8;
    top: 0px;
    left: 0.11825180053710938px;
    width: 1000px;
    height: 460px;
    ">
  
      <div
      style = "
      top: 70px;
      left: 73px;
      width: 100px;
      height: 30px;
      text-align: left;
      font: normal normal bold 22px/30px Open Sans;
      letter-spacing: 0px;
      color: #233862;
      opacity: 1;
      padding-top: 30px;
      padding-left: 10px;
      ">
      Hi Team!
      </div>
  
      <div
      style = "
      top: 110px;
      left: 73px;
      width: 740px;
      height: 20px;
      text-align: left;
      font: normal normal medium 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #233862;
      opacity: 1;
      padding-top: 10px;
      padding-left: 10px;
      ">
      Sharing the sms templates below. Please get it approved in the DLT portal as well as in Provider portals (${activeProviders.join()}).
      </div>
      <br/>
      <br/>
  
      <table
      style = "
      top: 178px;
      left: 25px;
      width: 950px;
      height: 220px;
      background: #FFFFFF 0% 0% no-repeat padding-box;
      box-shadow: 0px 3px 6px #00000026;
      border: 1px solid #EAEAEA;
      border-radius: 30px;
      opacity: 0.75;
      margin-left: auto;
      margin-right: auto;
      ">
  
      <tr>
      <td
      style = "
      top: 209px;
      left: 55px;
      width: 107px;
      height: 20px;
      text-align: left;
      text-decoration: underline;
      font: normal normal bold 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #2B478B;
      opacity: 1;
      padding-top: 50px;
      padding-left: 10px;
      ">
      Template Name
      </td>
  
      <td
      style = "
      top: 209px;
      left: 214px;
      width: 120px;
      height: 20px;
      text-align: left;
      text-decoration: underline;
      font: normal normal bold 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #2B478B;
      opacity: 1;
      padding-top: 50px;
      padding-left: 10px;
      ">
      Template Content
      </td>
  
      <td
      style = "
      top: 209px;
      left: 547px;
      width: 90px;
      height: 20px;
      text-align: left;
      text-decoration: underline;
      font: normal normal bold 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #2B478B;
      opacity: 1;
      padding-top: 50px;
      padding-left: 10px;
      ">
      Content Type
      </td>
  
      <td
      style = "
      top: 209px;
      left: 722px;
      width: 66px;
      height: 20px;
      text-align: left;
      text-decoration: underline;
      font: normal normal bold 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #2B478B;
      opacity: 1;
      padding-top: 50px;
      padding-left: 10px;
  
      ">
      Sender ID
      </td>
  
      <td
      style = "
      top: 209px;
      left: 873px;
      width: 64px;
      height: 20px;
      text-align: left;
      text-decoration: underline;
      font: normal normal bold 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #2B478B;
      opacity: 1;
      padding-top: 50px;
      padding-left: 10px;
  
      ">
      Providers
      </td>
      <tr/>
  
      <tr>
      <td
      style = "
      top: 289px;
      left: 74px;
      width: 51px;
      height: 20px;
      text-align: left;
      font: normal normal medium 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #231F20;
      opacity: 1;
      padding-bottom: 100px;
      padding-left: 10px;
      ">
      ${name}
      </td>
  
      <td
      style = "
      top: 269px;
      left: 214px;
      width: 269px;
      height: 60px;
      text-align: left;
      font: normal normal normal 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #231F20;
      padding-bottom: 100px;
      padding-left: 10px;
      ">
      ${content}
      </td>
  
      <td
      style = "
      top: 289px;
      left: 552px;
      width: 81px;
      height: 20px;
      text-align: left;
      font: normal normal medium 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #231F20;
      opacity: 1;
      padding-bottom: 100px;
      padding-left: 10px;
      ">
      ${contentType}
      </td>
  
      <td
      style = "
      top: 289px;
      left: 730px;
      width: 150px;
      height: 20px;
      text-align: left;
      font: normal normal medium 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #231F20;
      opacity: 1;
      padding-bottom: 100px;
      padding-left: 10px;
      ">
      ${senderIds.join()}
      </td>
  
      <td
      style = "
      top: 289px;
      left: 881px;
      width: 200px;
      height: 20px;
      text-align: left;
      font: normal normal medium 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #231F20;
      opacity: 1;
      padding-bottom: 100px;
      padding-left: 10px;
      ">
      ${activeProviders.join()}
      </td>
      </tr>
  
      </table>
      
      <div
      style = "
      top: 70px;
      left: 73px;
      width: 100px;
      height: 30px;
      text-align: left;
      font: normal normal bold 22px/30px Open Sans;
      letter-spacing: 0px;
      color: #233862;
      opacity: 1;
      padding-top: 30px;
      padding-left: 10px;
      ">
      Regards,
      </div>
      
      <div
      style = "
      top: 110px;
      left: 73px;
      width: 740px;
      height: 20px;
      text-align: left;
      font: normal normal medium 16px/20px Adobe Clean;
      letter-spacing: 0px;
      color: #233862;
      opacity: 1;
      padding-top: 10px;
      padding-left: 10px;
      ">
      Team BYJUS
      </div>
      
      </div>
      </body>
      </html>
    `;

    return emailContent;

}

module.exports = {
    getEmailContent
}