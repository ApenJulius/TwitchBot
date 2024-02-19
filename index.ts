type MyType = string;

type FakeObject = {
  name: string;
  age: number;
};

const HelloFunction = (person: FakeObject) => {
  console.log(`Hello ${person.age}`);
};

HelloFunction({
  age: 20,
  name: 'John',
});
