import React, { useEffect, useState, useRef } from 'react';
import { Form, Container, Button, Row } from 'react-bootstrap';
import {render} from 'react-dom';
import * as nearAPI from "near-api-js";

//IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

const { utils } = nearAPI;

const Account = (props) => {
    const [images, setImages] = useState([]);
    const [buffer, setBuffer] = useState();
    const [totalBalance, setTotalBalance] = useState(null);
    const [tipFromFan, setTipFromFan] = useState(0);

    const imageDescription = useRef();

    useEffect(() => {
        async function getAccountBalance() {
            let balance = await window.account.getAccountBalance()
            setTotalBalance(balance.total);
            console.log(balance)
        }

        async function getTipsFromFan() {
            let tips = await window.contract.getTotalTipsForOwner({ _owner_id: window.accountId });
            console.log(tips);
            setTipFromFan(tips);
        }
        
        getAccountBalance();
        getTipsFromFan();
    }, []);

    const uploadImage = async () => {
        console.log('Uploading file to ipfs');
        console.log(imageDescription.current.value);

        ipfs.add(buffer, async (err, result) => {
            console.log('IPFS result', result)
            if (err) {
                console.log(err);
                return;
            }  
            await window.contract.uploadImage({ 
                _imageHash: result[0].hash,
                _description: imageDescription.current.value
            });
            alert("Upload Successful");
        });
    }

    const captureFile = event => {
        event.preventDefault()
        const reader = new window.FileReader()
        let file = event.target.files[0]
        reader.readAsArrayBuffer(file)

        reader.onloadend = () => {
            setBuffer(Buffer(reader.result))        
        }
    }

    const tipImageOwner = async (id) => {
        await window.contract.tipImageOwner({ _id: images[id].id });
    }

    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '700px' }}>
            <div className="content mr-auto ml-auto">
              <h1>{window.accountId}</h1>
                <h4>Total Balance: {totalBalance === null ? "_" : parseFloat(utils.format.formatNearAmount(totalBalance)).toFixed(2) + " NEAR"}</h4>
                <h4>Total TIPS from fan: {tipFromFan} NEAR</h4>
              <p>&nbsp;</p>
              <h4>What's on your mind?</h4>
              <form onSubmit={(event) => {
                event.preventDefault()
                uploadImage()
              }} >
                <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={captureFile} />
                  <div className="form-group mr-sm-2">
                    <br></br>
            <Form>
                <Form.Group className='mb-3'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control ref={imageDescription} placeholder='Enter Description'></Form.Control>
                </Form.Group>
            </Form>
                  </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Upload</button>
              </form>
              <p>&nbsp;</p>
            </div>
          </main>
        </div>
      </div>
    );
}

export default Account 
