import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {createTheme} from '@mui/material';
import {connect} from 'react-redux';
import SingleGeneExpression from "./SingleGeneExpression";
import {setChartOptions, setDataset, setDialog, setDrawerOpen, setMessage, setTab} from "./actions";

const darkTheme = createTheme({palette: {mode: 'dark'}});
const lightTheme = createTheme({palette: {mode: 'light'}});

export default function SingleGeneExpressionWrapper() {

    return (
        <StyledEngineProvider>
            <ThemeProvider theme={lightTheme}>
                <SingleGeneExpression />
            </ThemeProvider>
        </StyledEngineProvider>
    );
}
