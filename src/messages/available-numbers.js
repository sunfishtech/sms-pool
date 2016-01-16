import { Record, List } from 'typed-immutable';

/*
message AvailableNumbers {
  required:
  numbers list[string]
}
*/
export default Record({
  /* Required Fields */
  numbers: new List(String)()
});
