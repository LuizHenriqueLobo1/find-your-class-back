/**
 * Processa os dados trazidos da planilha
 * @param rawData Dados brutos puxados da planilha
 * @param block Bloco
 * @return Dados formatados em um padrão mais coerentes para ser consumido
 */
export function getData(rawData, block) {
  const numberOfColumns = 7;
  const numberOfLines = rawData.length;
  const filteredArray = [];

  // Percorre a primeira coluna
  for (let i = 0; i < numberOfLines; i++) {
    const tempFilteredArray = [];
    for (let j = 0; j < numberOfColumns; j++) {
      tempFilteredArray.push(comparesCellWithPossibleExceptions(rawData[i][j]));
    }
    filteredArray.push(tempFilteredArray);
  }

  // Mantém o padrão de espaçamento entre os arrays
  filteredArray.push(new Array(7).fill('*'));

  // Percorre a segunda coluna
  for (let i = 0; i < numberOfLines; i++) {
    const tempFilteredArray = [];
    for (let j = numberOfColumns; j < numberOfColumns * 2; j++) {
      tempFilteredArray.push(comparesCellWithPossibleExceptions(rawData[i][j]));
    }
    filteredArray.push(tempFilteredArray);
  }

  // Cria um array contendo apenas as aulas
  const lessons = [];
  for (let i = 0; i < filteredArray.length; i++) {
    const tempLessons = [];
    for (let j = 0; j < filteredArray[i].length; j++) {
      if (filteredArray[i][0] !== '*') {
        tempLessons.push(filteredArray[i][j]);
      }
    }
    if (tempLessons.length) {
      lessons.push(tempLessons);
    }
  }

  // Monta o array final que será retornado
  const subArrayLength = 16;
  const totalSubArrays = Math.round(lessons.length / subArrayLength);
  const finalArray = [];
  for (let i = 0, j = 0; i < totalSubArrays; i++, j += 21) {
    const subArray = lessons.slice(i * subArrayLength, (i + 1) * subArrayLength);
    const finalObject = {
      roomName: filteredArray[j][1],
      classes: subArray,
      block,
    };
    finalArray.push(finalObject);
  }

  // makeBasicTestOnFinalArray(finalArray);

  return finalArray;
}

export function getFormattedData(data) {
  const finalData = [];

  data.forEach((item) => {
    const roomName = item.roomName;
    const block = item.block;

    item.classes.forEach((classSchedule) => {
      const time = classSchedule[0];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      for (let i = 1; i < classSchedule.length; i++) {
        const className = classSchedule[i];

        if (className !== '*') {
          const day = days[i - 1];
          const key = `${time}-${day}-${className}`;

          const newItem = {
            key,
            time,
            day,
            [day]: `${className} | ${block} - ${roomName}`,
          };

          finalData.push(newItem);
        }
      }
    });
  });

  return finalData;
}

function comparesCellWithPossibleExceptions(cell, block) {
  const arrayOfExceptions = [
    '',
    ' ',
    '\n',
    undefined,
    null,
    'HORÁRIO',
    ' HORÁRIO',
    '\nHORÁRIO',
    '12:40 / 13:20',
    '2822 - dificuldade de locomoção',
  ];
  if (String(cell).includes('OBS.:') || arrayOfExceptions.includes(cell)) {
    return '*';
  } else {
    return cell;
  }
}

function makeBasicTestOnFinalArray(finalArray) {
  let haveError = 0;
  for (const element of finalArray) {
    if (element.classes.length === 16) {
      if (element.classes[0][0] === '07:00 - 07:50' && element.classes[15][0] === '21:10 - 22:00') {
        console.log(`(✓) - ${element.roomName}`);
      } else {
        haveError++;
        console.log(`(✘) - ${element.roomName}`);
      }
    } else {
      haveError++;
      console.log(`(✘) - ${element.roomName}`);
    }
  }
  if (!haveError) {
    console.info(`\n\n(✔️) - ${finalArray[0].block} PASSOU!!!\n\n`);
  } else {
    console.info(`\n\n(❌) - ${finalArray[0].block} PERDEU!!!\n\n`);
  }
}
