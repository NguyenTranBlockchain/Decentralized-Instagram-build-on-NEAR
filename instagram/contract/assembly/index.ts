import { Context, logging, PersistentMap, storage, u128, ContractPromiseBatch, PersistentVector } from 'near-sdk-as'
(const DEFAULT_DONATION: u128 = u128.from('1000000000000000000000000'); // 1 NEAR

@nearBindgen
export class Image {
    id: u32;
    hash: string;
    description: string;
    tipAmount: u128;
    author: string; //account ID

    constructor(
        _id: u32,
        _hash: string,
        _description: string,
        _tipAmount: u128,
        _author: string
    ) {
        this.id = _id;
        this.hash = _hash;
        this.description = _description;
        this.tipAmount = _tipAmount;
        this.author = _author;
    }
}

const imageVector = new PersistentVector<Image>('img');
// const imagesMap = new PersistentMap<u32, Image>('img');

export function getAllImages(): Array<Image> {
    logging.log('ImageCount ');
    logging.log(imageVector.length);
    let result: Array<Image> = []
    for (let i = 0; i < imageVector.length; i++) {
        logging.log('images count');
        result[i]= imageVector[i];
    }
    return result
}

export function uploadImage(_imageHash: string, _description: string): void {
    assert(_imageHash.length > 0, 'ImageHash length must be > 0')
    assert(_description.length > 0, 'Description length must be > 0')
    
    let image = new Image(imageVector.length, _imageHash, _description, u128.from('0'), Context.sender)
    logging.log(image);
    imageVector.push(image)
}

export function tipImageOwner(_id: i32): void {
    logging.log('Tip Image');
    logging.log(_id);
    assert(_id <= imageVector.length - 1, 'index out of bound');
    let image = imageVector[_id]; 
    
    let amount = image.tipAmount;
    ContractPromiseBatch.create(Context.predecessor).transfer(DEFAULT_DONATION);
    image.tipAmount = amount + DEFAULT_DONATION;
    imageVector[_id] = image;
}
