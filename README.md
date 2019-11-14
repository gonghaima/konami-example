# Adding the “Konami Code” to Your React App Using Hooks

Anyone who plays video games for any length of time will probably know of a cheat code of some sort. Cheat codes have existed for ages, but one of the most famous has got to be the “Konami Code” so named for the fact the code was accidentally left in production code in the game Gradius, which was published by the Konami game company. To input the code, one simply entered the following keys in order: ⬆️, ⬆️, ⬇️, ⬇️, ⬅️, ➡️, ⬅️, ➡️, B, A, Start. After inputting the code, the player would be bestowed with some fantastic abilities or extra lives to assist in completing the game.

Since that original mistake, the code has since grown into gaming culture and has been intentionally added into other games, not just those published by Konami, but other publishers as well. The code has also made its way into pop culture in movies like Wreck-it Ralph and Gravity falls to name a two off the top of my head.

## How to Add The Konami Code to Our React App

So an obvious question that every developer has probably asked is: How do I pay homage to this interesting piece of gaming culture by adding the Konami Code to my React App. Of course, you don’t just want to implement it, you want to implement it using the most up to date patterns of React, namely, React Hooks. Lucky for you that is exactly what this post is about.
The first thing we need is a way to listen for key presses. We do this in JavaScript by adding an event listener to a DOM element. Event listeners do exactly what they say, they listen for specified events and run a call back function when the event is fired. You can add event listeners to any DOM node including the globalwindow object, which will let you listen to all events in your app.
There are two events we could listen to: keydown and keyup. (There is a deprecated event called a keypress which should be avoided). The difference should be obvious, the key down event is fired when you press a key down and the key up event is fired when we release the key. For our purposes, we are going to want to listen to the keydown event. So, first of all, let's create our custom hook called useHotKey and start listening to the keydown event inside a useEffect hook:

```javascript
function useHotKey(){
   useEffect(()=>{
      window.addEventListener("keydown",null);
   });
}
```

This is a great start, but we have already added a bug. Unless we explicitly remove our event listener, it will continue to run every time the event is fired, even if we don’t want to. Luckily, there is a removeEventListener that we can use to clean up our event listeners. To clean up our useEffect we need to return a function that does the cleanup, like this:

```javascript
function useHotKey(){
   useEffect(()=>{
      window.addEventListener("keydown",null);
      return ()=>{
         window.removeEventListener("keydown",null);
      }
   });
}
```

So far we have just been passing in null as a placeholder, but we need a function to listen to the event and do something when the event is fired. It is also important that the function passed into the addEventListener has the same reference value as the one passed into the removeEventListener otherwise it won’t remove the function from the listener. Let’s add a listen function to our useHotKey hook:

```javascript
function useHotKey(){
   const listen = () => null
   useEffect(()=>{
      window.addEventListener("keydown",listen);
      return ()=>{
         window.removeEventListener("keydown",listen);
      }
   });
}
```

Our hook is coming along, but our function still isn’t doing anything when it is called. Let’s give it some functionality. First of all, when our listen function is called it is passed a Keyboard Event object. This object has several methods and properties, which you can get details on at MDN. The property we are going to focus on is the key property, which returns a string representation of which key was just pressed. With that, we can do something when the correct key is pressed, like this:

```javascript
function useHotKey(){
   const listen = ({ key }) => {
      if(key === "Escape"){
         alert("Escape Key Pressed");
      }
   }
useEffect(() => {
      window.addEventListener("keydown",listen);
      return () => {
         window.removeEventListener("keydown",listen);
      }
   });
}
```

Our Hook wouldn’t be very useful if we hardcoded it to alert when hitting the escape key, so let’s make it a bit more dynamic:

```javascript
function useHotKey(hotKey, onMatch){
   const listen = ({ key }) => {
      if(key === hotKey){
         onMatch();
      }
   }
useEffect(() => {
      window.addEventListener("keydown",listen);
      return () => {
         window.removeEventListener("keydown",listen);
      }
   });
}
```

Now our hook will run a custom call back if the key matches our hotKey variable.
With that, we now have a functional hook that listens to a dynamic hotkey and will run the callback function we pass in when it is called. Our hook is missing one last thing: checking a whole sequence of hotKeys.
To do that we need a way to keep track of an array of hotKeys and only run the function if all the keys are pressed in sequential order. If a key is hit out of place, then it needs to start over and start listening from the beginning of the list. There are many ways we could do this, but here is one way:

```javascript
const createKeyChecker = (hotkeys = []) => {
    let index = 0;
    const TAIL = hotkeys.length - 1;
    return key => {
        if (key !== hotkeys[index]) {
            index = 0;
            return false;
        }
        if (index === TAIL) {
            index = 0;
            return true;
        }
        index++;
        return false;
    };
};
```

Briefly, this function takes in a sequence of hotKeys and creates a closure by returning a function that will not only check if the key pressed is in the correct order but will also reset back to the beginning if the wrong key is pressed in sequence.
We could update our useHotKey hook to look like this:

```javascript
function useHotKey(hotKeys, onMatch){
   const keyChecker = createKeyChecker([].concat(hotKeys));
   const listen = ({ key }) => {
      if(keyChecker(key)){
         onMatch();
      }
   }
useEffect(() => {
      window.addEventListener("keydown",listen);
      return () => {
         window.removeEventListener("keydown",listen);
      }
   });
}
```

But we are going to run into a problem. The problem is that on rerenders, our createKeyChecker function is going to be run again and we will lose that closure from the first render. What we need is a way to guarantee that we will get the same function with the same closure returned even on rerenders. We do this using the useMemo hook.
The useMemo is a unique hook that will return the same value if the dependencies used to calculate that value are the same. so we can update our hook to look like this:

```javascript
function useHotKey(hotKeys, onMatch){
   const keyChecker = useMemo(() =>
       createKeyChecker([].concat(hotKeys)),[hotKeys]
   );
const listen = ({ key }) => {
      if(keyChecker(key)){
         onMatch();
      }
   }
useEffect(() => {
      window.addEventListener("keydown",listen);
      return () => {
         window.removeEventListener("keydown",listen);
      }
   });
}
```

The only gotcha for our hook is that our hotKeys argument needs to be guaranteed to be the same. There are many ways we can handle it and would need to be app-specific, for our example we will hard code a value into our module.
Now we have a fully functional hook and we can use it like this:

```javascript
const Konami = () => {
   const [keysPressed, setKeysPress] = React.useState(false);
   
   useHotKey(sequence, () => setKeysPress(true));
return keysPressed && (
      <div>
        <h1>You hit the Konami Code</h1>
<BigButton onClick={() => setKeysPress(false)}>
           ResetCode
        </BigButton>
</div>
   );
};
```

I have put a working example up at code sandbox and you can check it out [here](https://codesandbox.io/s/konami-example-ubzrs):

This is all fun, but is there a real practical reason for a hook like this? Definitely! In this world of touch screens mice, we often forget the keyboard as an important input device. As the web moves to being a more app-like experience, our users are demanding more of our apps. Which encompass the keyboard. Dialog boxes and windows should be able to be controlled by our keyboard just as intuitively as it is with our mouse or touch screen. As we understand the DOM Api’s better and learn how to incorporate them into our React app, we will be able to create better user experiences for our users.