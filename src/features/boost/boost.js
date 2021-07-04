import * as React from "react";
import {useHistory} from "react-router-dom";
import {useParams} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {Avatar, Box, Button, Container, Grid, makeStyles, Typography} from "@material-ui/core";
import Loader from "../../components/loader";
import {ArrowLeft} from "@material-ui/icons";
import styles from "./styles"
import {isEmpty} from "../../helpers/utils";

const useStyles = makeStyles(styles);

const Boost = () => {
    const history = useHistory();
    const classes = useStyles();
    let { id } = useParams();
    const {vault, wallet, prices} = useSelector(state => ({
        vault: state.vaultReducer,
        wallet: state.walletReducer,
        prices: state.pricesReducer,
    }));
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = React.useState(true);
    const [item, setItemData] = React.useState(null);

    React.useEffect(() => {
        if(!isEmpty(vault.boosts) && vault.boosts[id]) {
            setItemData(vault.boosts[id]);
        } else {
            history.push('/error');
        }
    }, [vault.boosts, id, history]);

    React.useEffect(() => {
        if(item) {
            setIsLoading(false);
        }
    }, [item]);


    return (
        <Container className={classes.vaultContainer} maxWidth="xl">
            {isLoading ? (
                <Loader message="Getting boost data..."/>
            ) : (
                <Grid container style={{position: 'relative'}}>
                    <Grid item xs={12}>
                        <Button className={classes.btnGoBack} onClick={() => {history.push('/')}}><ArrowLeft /> Back to Explore</Button>
                        <Box className={classes.title} display="flex" alignItems="center">
                            <Box>
                                <Avatar alt={item.name} src={require('../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                            </Box>
                            <Box>
                                <Typography variant={"h1"}>{item.name} vault</Typography>
                            </Box>
                            <Box lineHeight={0}>
                                <Avatar alt="Fire" src={require('../../images/fire.png').default} imgProps={{ style: {objectFit: 'contain' } }} />
                            </Box>
                            <Box>
                                <Typography variant={"h2"}>BOOST</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default Boost;
