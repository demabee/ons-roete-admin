import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export const DEFAULT_CHECKLIST_DATA = {
  phase1: {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: false,
    step8: false,
  },
  phase2: {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  },
};

export const APPROVED_CHECKLIST_DATA = {
  phase1: {
    step1: true,
    step2: true,
    step3: true,
    step4: true,
    step5: true,
    step6: true,
    step7: true,
    step8: true,
  },
  phase2: {
    step1: true,
    step2: true,
    step3: true,
    step4: true,
  },
};

export default function useGetChecklistData(): any {
  const [checklist, setChecklist] = useState<any>();

  const refetch = useCallback((id: string) => {
    function fetchData() {
      const d = doc(db, 'checklist', id);
      getDoc(d).then((docSnap) => {
        if (docSnap.exists()) {
          const cl = {
            phase1: {
              ...DEFAULT_CHECKLIST_DATA.phase1,
              ...docSnap.data().phase1,
            },
            phase2: {
              ...DEFAULT_CHECKLIST_DATA.phase2,
              ...docSnap.data().phase2,
            },
          };
          setChecklist(cl);
          return cl;
        }
        console.log('No such document!');
        setChecklist(DEFAULT_CHECKLIST_DATA);
        return DEFAULT_CHECKLIST_DATA;
      });
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: checklist,
    fetchData: refetch,
  };
}
