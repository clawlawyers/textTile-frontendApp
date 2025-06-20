export const NODE_API_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? 'https://inventorymanagement-backend-trzq.onrender.com/api'
    : 'http://192.168.77.115:8800/api'; // Change this to your local IP address

export const getListOfFirms = (arrayOfFirms: any[]) => {
  const resArray = [];
  for (let i = 0; i < arrayOfFirms.length; i++) {
    resArray.push(arrayOfFirms[i].name);
  }
  return resArray;
};
