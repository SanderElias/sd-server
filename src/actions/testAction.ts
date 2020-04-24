import { src } from '../DynamicTs'
// const src = 'hello';

export const testAction1 = () => console.log('testAction 1');
export const testAction2 = () => console.log('testAction 2');

console.log('action file native execution.', src);
