   
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

  


 
  const isSuperAdmin = privileges?.role === "SUPER_ADMIN";
  const isAdmin = privileges?.role === "ADMIN";
  const isSupervisor = privileges?.role === "SUPERVISOR";
  const isTeamLead = privileges?.role === "TEAM_LEAD";
  const isITSupport = privileges?.role === "IT_SUPPORT";

  
  

  return { 
      isSuperAdmin,
     isAdmin,  
    isSupervisor,  
    isTeamLead,
    isITSupport
  };
}

 
