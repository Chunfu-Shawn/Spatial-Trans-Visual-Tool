import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {createTheme} from '@mui/material';
import SingleGeneExpression from "./SingleGeneExpression";

const lightTheme = createTheme({palette: {mode: 'light'}});

export default function SingleGeneExpressionWrapper(props) {

    return (
        <StyledEngineProvider>
            <ThemeProvider theme={lightTheme}>
                <SingleGeneExpression gene={props.gene}/>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}
