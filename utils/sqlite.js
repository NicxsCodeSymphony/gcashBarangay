import * as FileSystem from 'expo-file-system'


export const saveDataToFile = async (data, fileName) => {
    const path = `${FileSystem.documentDirectory}${fileName}.json`;
    try {
        await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
        return true; 
    } catch (error) {
        // console.error("Failed to save data:", error);
        return false;
    }
};


export const saveData = async (filename, data) =>{ 
    const path = `${FileSystem.documentDirectory}${filename}.json`; 
    const ticketCountPath = `${FileSystem.documentDirectory}ticket_counter.json`;

    try {
        let existingData = [];
        let ticketCounter = 1;
        
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists) {
            const existingContent = await FileSystem.readAsStringAsync(path);
            existingData = JSON.parse(existingContent);
        }

        const counterInfo = await FileSystem.getInfoAsync(ticketCountPath);
        if (counterInfo.exists) {
            const counterContent = await FileSystem.readAsStringAsync(ticketCountPath);
            ticketCounter = JSON.parse(counterContent).counter;
        }

        const processedData = Array.isArray(data) 
            ? data.map(item => ({
                ...item, 
                // ticket_id: ticketCounter++
            }))
            : {
                ...data, 
                // ticket_id: ticketCounter++
            };

        if (Array.isArray(processedData)) {
            existingData = [...existingData, ...processedData];
        } else {
            existingData.push(processedData);
        }

        await FileSystem.writeAsStringAsync(path, JSON.stringify(existingData));
        
        await FileSystem.writeAsStringAsync(ticketCountPath, JSON.stringify({ 
            counter: ticketCounter 
        }));

        return true;
    }
    catch(err){
        // console.error("Error saving data", err)
        return false
    }
}

export const fetchData = async (file) => {
    const path = `${FileSystem.documentDirectory}${file}.json`;  

    try {
        const fileInfo = await FileSystem.getInfoAsync(path);  

        if (fileInfo.exists) {
            const tokenData = await FileSystem.readAsStringAsync(path);
            return JSON.parse(tokenData);
        } else {
            console.log(`File at ${path} does not exist.`); 
            return null;
        }
    } catch (error) {
        // console.error("Error fetching data:", error);
        return null; 
    }
};

export const updateData = async (filename, updatedData) => {
    const path = `${FileSystem.documentDirectory}${filename}.json`;

    try {
        // Write the entire updated dataset
        await FileSystem.writeAsStringAsync(path, JSON.stringify(updatedData));
        return true;
    } catch (err) {
        console.error("Error updating data", err);
        return false;
    }
};

export const deleteData = async (fileName) => {
    const path = `${FileSystem.documentDirectory}${fileName}.json`;
    try {
        await FileSystem.deleteAsync(path);
        return true; 
    } catch (error) {
        // console.error("Failed to delete file:", error);
        return false; 
    }
};