import { BLOCKS, POSSIBLE_START_VALUES_OF_LINE } from '../utils/utils.js';

export function getFinalData(data, block) {
  const finalHorizontalTablesAmount = BLOCKS.find(element => element.id === block).horizontalTablesAmount;

  const finalData = data.map(element => {
    if(POSSIBLE_START_VALUES_OF_LINE.includes(element[0])) {
      return element;
    }
  });

  const filteredFinalData = finalData.filter(element => {
    if(element !== undefined || element !== null) {
      return element;
    }
  });
  
  const firstColumnArray  = [];
  const secondColumnArray = [];

  for(let i = 0; i < filteredFinalData.length; i++) {
    const firstTempArray = [];
    const secondTempArray = [];
    for(let j = 0; j < filteredFinalData[i].length; j++) {
      if(j <= 6) {
        firstTempArray.push(filteredFinalData[i][j]) 
      } else {
        secondTempArray.push(filteredFinalData[i][j]) 
      }
    }
    firstColumnArray.push(firstTempArray);
    secondColumnArray.push(secondTempArray);
  }

  const filteredFirstColumnArray = generateCustomArrayOfSubarrays(firstColumnArray, finalHorizontalTablesAmount); 
  const filteredSecondColumnArray = generateCustomArrayOfSubarrays(secondColumnArray, finalHorizontalTablesAmount);

  const rooms = [];
  for(const firstColumnElement of filteredFirstColumnArray) {
    rooms.push(firstColumnElement);
  }
  for(const secondColumnElement of filteredSecondColumnArray) {
    rooms.push(secondColumnElement)
  }

  const newRooms = rooms.map(subarray => subarray.slice(1));

  const filteredRooms = [];
  rooms.forEach((room, index) => {
    filteredRooms.push({
      nomeDaSala: room[0][1], 
      aulas: newRooms[index]
    }); 
  });

  const finalRooms = { bloco: block, ...filteredRooms };

  return finalRooms;
}

function generateCustomArrayOfSubarrays(array, amount) {
  const subarrays = [];
  const subarrayLength = Math.ceil(array.length / amount);

  for (let i = 0; i < array.length; i += subarrayLength) {
    const subarray = array.slice(i, i + subarrayLength);
    subarrays.push(subarray);
  }

  return subarrays;
}
