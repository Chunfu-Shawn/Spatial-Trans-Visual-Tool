# Spatial Transcriptome Visual Tool

This project refers to [Cirrocumulus](https://github.com/lilab-bcb/cirrocumulus) and was developed 
to be used under serverless.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Quick Start
This project can represent spatial trancriptome dataset under serverless, so prepare the dataset(s) in jsonl format using
h5ad format data and run this project.

### Clone the Spatial-Trans-Visual-Tool repository:
`git clone https://github.com/Chunfu-Shawn/Spatial-Trans-Visual-Tool.git`
###  Change to cirrocumulus directory:
`cd Spatial-Trans-Visual-Tool`
### Install JavaScript dependencies:
`yarn install`
### Prepare dataset(s) in jsonl format:
you can use [Cirrocumulus](https://github.com/lilab-bcb/cirrocumulus) to process .h5ad data to .jsonl data

`pip install cirrocumulus`</br>
`cirro prepare_data pbmc3k.h5ad --format jsonl`

### Create the file datasets.json in the public directory:
`
[
{
"id": "pbmc3k",
"name": "pbmc3k",
"url": "pbmc3k/pbmc3k.jsonl"
}
]
`
### Move your dataset files to build:
`mv pbmc3k public`
### Test locally:
`yarn run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.