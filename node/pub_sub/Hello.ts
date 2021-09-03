// This is an industrial-grade general-purpose greeter function:
function greet(person: string, date: Date) {
    // console.log(`Hello ${person}, today is ${date}!`);
    console.log("Hello " + person + ", today is " + date.toDateString() + "!");
}

const d: Date = new Date();
greet("Maddison", d);