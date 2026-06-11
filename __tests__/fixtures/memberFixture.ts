export const peterMember = {
  firstname: "Peter",
  lastname: "Spiessens",
  gender: "Male",
  email: "peter.spiessens@example.com",
  phonenumber: "+32472684297",
  has_payed: false,
  is_student: true,
  address_id: 1,
};

export const peterMemberUpdate = {
  ...peterMember,
  gender: "Female",
  email: "peter.spiessens69@example.com",
};
