import React, { useEffect, useState, useRef } from 'react';

import { Form, Container, Button, Row } from 'react-bootstrap';
import {render} from 'react-dom';
//IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
const Home = (props) => {
    const [images, setImages] = useState([]);
    const [buffer, setBuffer] = useState();

    const imageDescription = useRef();

    useEffect(() => {
        async function getListImages() {
            setImages(await window.contract.getAllImages());
        }
        getListImages();
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
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <h2>Share Image</h2>
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
                <button type="submit" className="btn btn-primary btn-block btn-lg">Upload!</button>
              </form>
              <p>&nbsp;</p>
              { images.map((image, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <small className="text-muted">{image.author}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${image.hash}`} style={{ maxWidth: '420px'}}/></p>
                        <p>{image.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                            {image.tipAmount / 10**24} NEAR
                        </small>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={image.id}
                          onClick={(event) => {
                              tipImageOwner(event.target.name)
                            // let tipAmount = window.web3.utils.toWei('0.1', 'Ether')
                            // console.log(event.target.name, tipAmount)
                          }}
                        >
                          TIP 1 NEAR
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
}

export default Home;
