const fs = require('fs');
const prompt = require('prompt-sync')();

var variables = new Map();
var functions = new Map();

let validElse = false;
let wasIfLoop = false;

let consoledata = "";

let askAnswer = "";

console.clear();

console.log(" _____   _   _          ____                  _           _   ");
console.log("|  ___| (_) | |   ___  / ___|    ___   _ __  (_)  _ __   | |_ ");
console.log("| |_    | | | |  / _ \\ \\___ \\   / __| | '__| | | | '_ \\  | __|");
console.log("|_|     |_| |_|  \\___| |____/   \\___| |_|    |_| | .__/   \\__|");
console.log("                                                 |_|          ");

RunCommand = function(command) {
    if(!command.startsWith('//')) {
    command = command.split(" ");

    wasIfLoop = false;

    //Create A Variable
    if(command[0] == "create" && command.length >= 4) {
        if(command[1] == "variable") {
            if(command[2] == "named") {
                variables.set(command[3], '');
            }
        }

        if(command[1] == "function") {
            if(command[2] == "named") {
                functions.set(command[3], []);
            }
        }
    }

    //Get A Variable Value
    if(command[0] == "get" && command.length >= 5) {
        if(command[1] == "value") {
            if(command[2] == "from") {
                if(command[3] == "variable") {
                    if(variables.has(command[4])) {
                        consoledata += variables.get(command[4]) + "\n";
                        console.log(variables.get(command[4]));
                    } else {
                        console.log(`There Is No Variable Named '${command[4]}'!`)
                    }
                }
            }
        }
    }

    //Set A Variable Value
    if(command[0] == "set" && command.length >= 6) {
        if(command[1] == "variable") {
            if(command[4] == "to") {
                if(variables.has(command[2])) {
                    //Random
                    for(f = 0; f < command.length; f++) {
                        if(command[f].startsWith('rand(') && command[f].endsWith(')')) {
                            try {
                                command[f] = command[f].slice(5, -1);
                                command[f] = command[f].split(",");
                                command[f] = Math.round(Math.random() * (command[f][1]-command[f][0]) + command[f][0])+1;
                            } catch (e) {
                                command[f] = "";
                            }
                            
                            continue;
                        } else if(command[f].startsWith('file(') && command[f].endsWith(')')) {
                            //Read From File
                            try {
                                command[f] = command[f].slice(5, -1);
                                if(fs.existsSync(command[f])) {
                                    let fileExtension = command[f].split('.')[1];
                                    if(fileExtension == 'fs' || fileExtension == 'txt') {
                                        command[f] = fs.readFileSync(command[f], 'utf-8');
                                    } else {
                                        console.log('Invalid File Extension! .' + fileExtension);
                                    }
                                } else {
                                    console.log(command[f] + ' Does Not Seem To Exist!');
                                }
                            } catch (e) {
                                command[f] = "";
                            }
                            continue;
                        }
                    }

                        

                    //Set Variable Value
                    variables.set(command[2], command.slice(5).join(" "));
                } else {
                    console.log(`There Is No Variable Named '${command[2]}'!`)
                }
            }
        }
    }

    if(command[0] == "set" && command.length >= 5) {
        if(command[1] == "function") {
            if(command[3] == "to") {
                if(functions.has(command[2])) {
                    functions.set(command[2], command.splice(4).join(" ").split(" | "));
                } else {
                    console.log(`No Function Named ${command[2]}!`)
                }
            }
        }
    }

    if(command[0] == "run" && command.length == 2) {
        if(functions.has(command[1])) {
            let actions = functions.get(command[1]);
            for(a = 0; a < actions.length; a++) {
                RunCommand(actions[a]);
            }
        } else {
            console.log(`No Function Named ${command[1]}!`);
        }
    }

    //Change A Variable Value
    if(command[0] == "change" && command.length >= 5) {
        if(command[1] == "variable") {
            if(command[3] == "by") {
                if(variables.has(command[2])) {
                    if(Number(variables.get(command[2])) != NaN && Number(command[4]) != NaN) {
                        variables.set(command[2], Number(variables.get(command[2])) + Number(command[4]));
                    } else {
                        console.log('Can Not Change A Variable If It Is Not A Number!');
                    }
                } else {
                    console.log(`There Is No Variable Named '${command[2]}'!`)
                }
            }
        }
    }

    //Do An Action Multiple Times (Loop)
    if (command[0] == "for" && command.length >= 5) {
        if(command[1].startsWith('calc(') && command[1].endsWith(')')) {
            let equation = command[1].slice(5, -1);

            try {
                command[1] = eval(equation);
            } catch (e) {
                command[1] = "Not A Number!"
                return;
            }
        }

        if (!isNaN(Number(command[1])) && command[2] == "times" && command[3] == "do") {
            const n = Number(command[1]);
            const action = command.slice(4).join(" ");
            for (let i = 0; i < n; i++) {
                RunCommand(action);
            }
        }
    
    }

    //Repeat Forever
    if(command[0] == "forever" && command.length >= 3) {
        if(command[1] == "do") {
            let action = command.splice(2).join(" ");
            while(true) {
                RunCommand(action);
            }
        }
    }

    //If Statements
    if(command[0] == "if" && command.length >= 6) {
        if(command[4] == "do") {
            let compare = command[2];
            let comp1 = command[1];
            let comp2 = command[3];
            let act = command.splice(5).join(" ");
            wasIfLoop = true;

            let numberComp1 = 0;
            let numberComp2 = 0;

            if(variables.has(comp1)) {
                numberComp1 = variables.get(comp1);
            } else if(!isNaN(comp1)) {
                numberComp1 = Number(comp1);
            } else {
                console.log(`Can Not Find Value Of ${comp1}!`);
                return;
            }

            if(variables.has(comp2)) {
                numberComp2 = variables.get(comp2);
            } else if(!isNaN(comp2)) {
                numberComp2 = Number(comp2);
            } else {
                console.log(`Can Not Find Value Of ${comp2}!`);
                return;
            }
            

            if(compare == ">") {
                if(numberComp1 > numberComp2) {
                    RunCommand(act);
                    return;
                }
            } else if(compare == "<") {
                if(numberComp1 < numberComp2) {
                    RunCommand(act);
                    return;
                }
            } else if(compare == "=" || compare == "==" || compare == "===") {
                if(numberComp1 == numberComp2) {
                    RunCommand(act);
                    return;
                }   
            } else if(compare == ">=") {
                if(numberComp1 >= numberComp2) {
                    RunCommand(act);
                    return;
                }

            } else if(compare == "<=") {
                if(numberComp1 <= numberComp2) {
                    RunCommand(act);
                    return;
                }
            } else if(compare == "!=") {
                if(numberComp1 != numberComp2) {
                    RunCommand(act);
                    return;
                }
            }

            validElse = true;
        }
    }

    //Else (For If Loops)
    if(command[0] == "else" && command.length >= 2) {
        if(validElse) {
            validElse = false;
            RunCommand(command.splice(1).join(" "));
            return;
        }
    }

    if(!wasIfLoop) {
        validElse = false;
    }

    //Write To Console
    if(command[0] == "write" && command.length >= 2) {
        for(n = 0; n < command.length; n++) {
            //Get Variable
            if(command[n].startsWith('var(') && command[n].endsWith(')')) {
                if(variables.has(command[n].slice(4, -1))) {
                    command[n] = variables.get(command[n].slice(4, -1));
                } else {
                    command[n] = "";
                }
                continue;
            }

            //Calculate Math
            if(command[n].startsWith('calc(') && command[n].endsWith(')')) {
                let equation = command[n].slice(5, -1);

                try {
                    command[n] = eval(equation);
                } catch (e) {
                    command[n] = "";
                }

                continue;
            }

            //Read From File
            if(command[n].startsWith('file(') && command[n].endsWith(')')) {
                try {
                    command[n] = command[n].slice(5, -1);
                    if(fs.existsSync(command[n])) {
                        let fileExtension = command[n].split('.')[1];
                        if(fileExtension == 'fs' || fileExtension == 'txt') {
                            command[n] = fs.readFileSync(command[n], 'utf-8');
                        } else {
                            console.log('Invalid File Extension! .' + fileExtension);
                        }
                    } else {
                        console.log(command[n] + ' Does Not Seem To Exist!');
                    }
                } catch (e) {
                    command[n] = "";
                }
                continue;
            }
        }
        
        let data = command.splice(1).join(" ");

        consoledata += data + "\n";
        console.log(data);
    }

    //Clear Console
    if(command[0] == "clear" && command.length >= 1) {
        consoledata = "";
        console.clear();
    }

    //Save Console
    if(command[0] == "save" && command.length >=2) {
        let file = command[1];
        if(!(file.split(".").length == 2)) {
            console.log('Invalid Format Type!');
            return;
        } else {
            let fileExtension =  file.split(".")[1];
            if(fileExtension == ("txt" || "fs")) {
                if(!(command.length >= 4 && command[2] == 'variable')) {
                    if(fs.existsSync(file)) {
                        fs.writeFileSync(file, consoledata);
                        console.log(`Overwriting ${file}`);
                    } else {
                        fs.writeFileSync(file, consoledata);
                        console.log(`Creating ${file} And Saving Data To It`);
                    }
                } else {
                    if(variables.has(command[3])) {
                        if(fs.existsSync(file)) {
                            fs.writeFileSync(file, variables.get(command[3]));
                            console.log(`Overwriting ${file}`);
                        } else {
                            fs.writeFileSync(file, variables.get(command[3]));
                            console.log(`Creating ${file} And Saving Data To It`);
                        }
                    } else {
                        console.log(`Variable ${command[2]} Does Not Exist!`);
                    }
                }
            } else {
                console.log('Invalid File Extension!');
            }
        }
    }

    //Ask User
    if(command[0] == "ask" && command.length >= 2 && command.includes("/")) {
        if(variables.has(command.join(" ").split("/ ")[1])) {
            const answer = prompt(command.join(" ").split("/ ")[0].split(" ").slice(1).join(" "));
            variables.set(command.join(" ").split("/ ")[1], answer);
        } else {
            console.log(`No Variable Named "${command.join(" ").split("/ ")[1]}"!`);
        }
        
    }

    //Run File
    if(command[0] == "exec" && command.length == 2) {
        if(command[1].includes('.')) {
            let fileExtension = command[1].split(".")[1];
            if(fileExtension == "fs") {
                if(fs.existsSync(command[1])) {
                    try {
                        let data = fs.readFileSync(command[1], 'utf-8');
                        data = data.split('\r\n');
                        for(i = 0; i < data.length; i++) {
                            RunCommand(data[i]);
                        }
                    } catch(e) {
                        console.log('There Was An Unknown Error Trying To Execute The File! \n', e);
                    }
                    
            } else {
                console.log('File Does Not Exist!');
            }
            } else {
                console.log('Invalid File Extension! (Must Be .FS!)');
            }
        } else {
            console.log('Must Include File Extension!');
        }
    }

    //Help
    if((command[0] == "help" || command[0] == "docs") && command.length == 1) {
        console.log('//Link To Docs');
    }

    //Debugging
    if(command[0] == "inspect" && command.length >= 2) {
        console.log('----DEBUGGING----');
        if(command.length == 3 && command[1] == "all" && command[2] == "variables") {
            console.log(variables);
        }

        if(command.length == 3 && command[1] == "all" && command[2] == "functions") {
            console.log(functions);
        }

        console.log('-----------------');
    }

    //Exit Program
    if(command[0] == "exit" && command.length == 1) {
        process.exit();
    }
}
}

AskForCommand = function() {
    const command = prompt(">");
    RunCommand(command);
}

while(true) {
    AskForCommand();
}