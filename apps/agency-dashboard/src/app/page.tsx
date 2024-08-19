import { AgencyDashobardUi } from '@agency-dashboard/ui';
import getUserData from '../Actions/GET/getUser';

export default async function Page() {
  const res = await getUserData();
  return (
    <div className="flex flex-col gap-2">
      <div>
        Agency-dashboard fix 3
        {res[0].fullName}
        {res[0].password}
      </div>

      <div>
        <AgencyDashobardUi />
      </div>
    </div>
  );
}
