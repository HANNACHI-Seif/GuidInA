import { exec } from 'child_process';


let sentiment_isPositive = (text: string) => {
    exec(`python sentiment_analysis.py "${text}"`, (error, stdout) => {
        if (error) {
          console.error(`Error executing the Python script: ${error}`);
          return {
            error
          }
        }
        // Parse the output from the Python script
        const output = parseInt(stdout.trim());
        if (output == 1) return { error: null, result: true }
        return { error: null, result: false }
    });
}

export {
    sentiment_isPositive
}
