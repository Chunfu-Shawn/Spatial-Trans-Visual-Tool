# Spatial Transcriptome Visual Tool

This project refers to [Cirrocumulus](https://github.com/lilab-bcb/cirrocumulus) and was developed 
to be used under serverless.

This project was bootstrapped with [Next.js](https://github.com/vercel/next.js).

## 1. Quick Start
This project can represent spatial trancriptome dataset under serverless, so prepare the dataset(s) in jsonl format using
h5ad format data and run this project.

### Clone the Spatial-Trans-Visual-Tool repository:
`git clone https://github.com/Chunfu-Shawn/Spatial-Trans-Visual-Tool.git`
###  Change to cirrocumulus directory:
`cd Spatial-Trans-Visual-Tool`
### Install JavaScript dependencies:
`yarn install`
### Prepare dataset(s) in jsonl format:
you can use [Cirrocumulus](https://github.com/lilab-bcb/cirrocumulus) to process .h5ad data to .jsonl data.\
```
pip install cirrocumulus
cirro prepare_data pbmc3k.h5ad --format jsonl
```
### Create the file datasets.json in the public directory:
```json lines
[
    {
        "id": "pbmc3k",
        "name": "pbmc3k",
        "url": "pbmc3k/pbmc3k.jsonl"
    }
]
```
### Move your dataset files to build:
`mv pbmc3k public`
### Test locally:
Runs the app in the development mode.\
`yarn run dev`\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.
You may also see any lint errors in the console.


## 2. Customization API
### Dataset
| Attributions | Type | Default | Description                |
|--------------|------|-------|----------------------------|
| dataset      | JSON | null  | dataset users want to view |

Example:
```javascript
dataset = {
    "id": "adata_a2p2",
    "name": "adata_a2p2",
    "url": "/datasets/GSM5833739_10x_Visium_deal/GSM5833739_10x_Visium_deal.jsonl"
} // the url means loads dataset from localhost:3000
<VisualTool dataset={dataset}/>
```

### Module Size
| Attributions | Type      | Default | Description                                 |
|--------------|-----------|---------|---------------------------------------------|
| setCustom    | true/false | false   | custom size or adaptive size                |
| drawerOpen       | true/false | true    | whether to open SideBar in default          |
| width        | "number"  | 1100    | the width of this module                    |
| height       | "number" | 800     | the max height of this module               |
| chartSize       | "number" | 300     | the height and width of this gallary images |

Example:
```javascript
<VisualTool setCustom={true} drawerOpen={false}
            width={1200} height={1000}
            chartSize={220} dataset={dataset}/>
```
