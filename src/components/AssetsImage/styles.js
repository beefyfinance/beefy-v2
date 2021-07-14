const styles = theme => ({
    icon: {
        color: theme.palette.text.primary,
        'flex-shrink': 0,
        width: '40px',
        height: '40px',
        '& .MuiAvatarGroup-avatar': {
            border: 'none',
            width: '65%',
            height: '65%',
            '&:first-child': {
                position: 'absolute',
                left: 0,
            },
            '&:last-child': {
                position: 'absolute',
                right: 0,
            },
        },
    },
});

export default styles;
