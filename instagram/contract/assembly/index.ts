import { Context, logging, PersistentMap, storage, u128, ContractPromiseBatch } from 'near-sdk-as'

const DEFAULT_DONATION: u128 = u128.from("1000000000000000000000000"); // 1 NEAR

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

let imageCount: u32 = 0;
const imagesMap = new PersistentMap<u32, Image>('img');

export function uploadImage(_imageHash: string, _description: string): void {
    assert(_imageHash.length > 0, 'ImageHash length must be > 0')
    assert(_description.length > 0, 'Description length must be > 0')

    imageCount++;
    let image = new Image(imageCount, _imageHash, _description, u128.from('0'), Context.sender)
    imagesMap.set(imageCount, image)
}

export function tipImageOwner(_id: u32): void {
    assert(_id <= imageCount, 'index out of bound');
    let image = imagesMap.getSome(_id);
    
    let amount = image.tipAmount;
    ContractPromiseBatch.create(Context.sender).transfer(DEFAULT_DONATION);
    image.tipAmount = amount + DEFAULT_DONATION;
    imagesMap.set(_id, image);
}
