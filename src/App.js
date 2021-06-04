import { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const BASE_URL = 'https://stage.getprospa.com/api/v1';

  const [subAccounts, setSubAccounts] = useState([]);
  const [currentAllocation, setCurrentAllocation] = useState(100);

  // console.log('subAccounts: ', subAccounts);

  const fetchSubAccounts = async () => {
    const res = await fetch(`${BASE_URL}/account/holder_sub_wallets/577`, {
      headers: {
        Authorization:
          'Token 0b2146ca1735c3f4b1a93b17d2a30976430609b4a55ef465e68db4bdbccf7cad',
      },
    });
    const data = await res.json();
    setSubAccounts(data.data);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const walletAllocation = subAccounts.map(acc => ({
      walletID: acc.biz_wallet_id,
      walletShare: acc.incoming_allocation,
    }));
    const res = await fetch(`${BASE_URL}/account/stake_share_add`, {
      method: 'POST',
      body: {
        biz_account_id: 577,
        wallet_allocation: walletAllocation,
      },
      headers: {
        Authorization:
          'Token 0b2146ca1735c3f4b1a93b17d2a30976430609b4a55ef465e68db4bdbccf7cad',
      },
    });
    const data = await res.json();
    if (data) {
      console.log('submit res data: ', data);
      fetchSubAccounts();
    }
  };

  const reset = async () => {
    const res = await fetch(`${BASE_URL}/account/readjust_wallet_share/`, {
      method: 'POST',
      body: {
        biz_account_id: 577,
      },
      headers: {
        Authorization:
          'Token 0b2146ca1735c3f4b1a93b17d2a30976430609b4a55ef465e68db4bdbccf7cad',
      },
    });
    const data = await res.json();
    if (data) {
      console.log('reset data: ', data);
      fetchSubAccounts();
    }
  };

  const handleChange = (e, index) => {
    const updated = [...subAccounts];
    updated[index].incoming_allocation = e.target.value;
    setSubAccounts(updated);

    const currentValue = subAccounts.reduce((acc, value) => {
      if (value.biz_wallet_type !== 'current') {
        acc += +value.incoming_allocation;
      }
      return acc;
    }, 0);

    // const newCurrentAllocation = 100 - updated[index].incoming_allocation;
    const newCurrentAllocation = 100 - currentValue;
    setCurrentAllocation(newCurrentAllocation);
    console.log('hey: ', currentValue);
  };

  useEffect(() => {
    fetchSubAccounts();
  }, []);
  return (
    <div className="App">
      <form className="form">
        {subAccounts.map((acc, i) => {
          const isCurrent = acc.biz_wallet_type === 'current';
          return (
            <div key={acc.biz_wallet_id}>
              <div>
                <label htmlFor={acc.biz_wallet_id}>{acc.biz_wallet_type}</label>
              </div>
              <div>
                <input
                  style={{ width: '150px' }}
                  id={acc.biz_wallet_id}
                  className="input"
                  type="number"
                  value={
                    isCurrent ? currentAllocation : acc.incoming_allocation
                  }
                  onChange={e => handleChange(e, i)}
                  disabled={isCurrent}
                  min="0"
                  max="100"
                />
              </div>
              {isCurrent && currentAllocation < 0 && (
                <span>Current value cannot be less than 0</span>
              )}
            </div>
          );
        })}

        <button type="submit" onClick={handleSubmit}>
          Save
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </form>
    </div>
  );
};

export default App;
