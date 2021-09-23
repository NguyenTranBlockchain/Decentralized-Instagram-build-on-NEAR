import React, { useEffect, useState, useRef } from 'react';
import { Form, Container, Button, Row } from 'react-bootstrap';
import {render} from 'react-dom';
import * as nearAPI from "near-api-js";

const { utils } = nearAPI;

const Home = (props) => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        async function getListImages() {
            setImages(await window.contract.getAllImages());
        }
        async function initContract() {
            await window.contract.init_contract();
        }
        
        initContract();
        getListImages();
    }, []);

    const tipImageOwner = async (id) => {
        await window.contract.tipImageOwner({ _id: images[id].id });
        alert("Tip successful")
    }

    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              { images.map((image, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                        <small className="text-muted">Posted by: {image.author}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${image.hash}`} style={{ maxWidth: '420px'}}/></p>
                        <p>{image.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                            {utils.format.formatNearAmount(image.tipAmount)} NEAR
                        </small>
                        {window.accountId !== image.author ?
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={image.id}
                          onClick={(event) => {
                              tipImageOwner(event.target.name)
                          }}
                        >
                          TIP 1 NEAR
                        </button>
                          : <></>}
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

export default Home
