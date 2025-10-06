const superAdmin = ["ROLE_SUPERADMIN",];
const admin = ["ROLE_ADMIN",];
const subAdmin = ["ROLE_SUPERADMIN", "ROLE_ADMIN", "ROLE_SUBADMIN"];
const supervisor = [
  "ROLE_SUPERADMIN",
  "ROLE_ADMIN",
  "ROLE_SUBADMIN",
  "ROLE_SUPERVISOR",
];
const subSupervisor = [
  "ROLE_SUPERADMIN",
  "ROLE_ADMIN",
  "ROLE_SUBADMIN",
  "ROLE_SUPERVISOR",
  "ROLE_SUBSUPERVISOR",
];
const user = [
  "ROLE_SUPERADMIN",
  "ROLE_ADMIN",
  "ROLE_SUBADMIN",
  "ROLE_SUPERVISOR",
  "ROLE_SUBUSUPERVISOR",
  "ROLE_USER",
];
const dashBoard1 = [
  "ROLE_SUPERADMIN",
  "ROLE_ADMIN",
  "ROLE_SUBADMIN",
  "ROLE_SUPERVISOR",
  "ROLE_SUBUSUPERVISOR",
  "ROLE_USER",
];
const dashBoard2 = [
  "ROLE_SUPERADMIN",
  "ROLE_ADMIN",
  "ROLE_SUBADMIN",
  "ROLE_SUPERVISOR",
  "ROLE_SUBSUPERVISOR",
];

export {
  admin,
  subAdmin,
  supervisor,
  subSupervisor,
  user,
  dashBoard1,
  dashBoard2,
  superAdmin
};
