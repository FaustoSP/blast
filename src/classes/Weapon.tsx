export class Weapon {
  // Assumption: every weapon name is unique (from my limited knowledge of CS:GO, I think that is the case)
  // If it wasn't the case, the simple solution is to add an id field.
  // Note that this field is a bit weird, since it includes some information about the kill (example: headshot)
  // I consider this to be a positive (kill feeds in shooters often show this contextual info), but perhaps a
  // cleaner way of handling this would be having it in a separate field. I think this is good enough for now.
  nameWithContext: string;
  kills: number = 1; // A weapon object is only instantiated when it gets a kill, so we start that number at 1

  constructor(name: string) {
    this.nameWithContext = name;
  }
}
