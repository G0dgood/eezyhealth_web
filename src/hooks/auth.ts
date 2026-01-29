   
export interface User {
  data: {
    privileges: Privilege[];
  };
}

export interface Privilege {
  role: string;
}

export function getUserPrivileges(): {
  isSuperAdmin: boolean;
  isSupervisor: boolean;
  isAdmin: boolean;  
  isTeamLead: boolean;  
  isITSupport: boolean;  

} {

   
    // @ts-expect-error - localStorage.getItem can return null, but JSON.parse expects string
	const userString = JSON.parse(localStorage.getItem("eezy-user-info"));
  const userInfo = userString ? userString : null;
  const privileges = userInfo || [];

  


 
  const isSuperAdmin = privileges?.role === "super_admin";
  const isAdmin = privileges?.role === "admin";
  const isSupervisor = privileges?.role === "supervisor";
  const isTeamLead = privileges?.role === "team_lead";
  const isITSupport = privileges?.role === "it_support";

  
  

  return { 
      isSuperAdmin,
     isAdmin,  
    isSupervisor,  
    isTeamLead,
    isITSupport
  };
}

 
