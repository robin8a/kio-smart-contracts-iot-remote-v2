// This is an industrial-grade general-purpose greeter function:
function greet(person, date) {
    // console.log(`Hello ${person}, today is ${date}!`);
    console.log("Hello " + person + ", today is " + date.toDateString() + "!");
}
var d = new Date();
greet("Maddison", d);
